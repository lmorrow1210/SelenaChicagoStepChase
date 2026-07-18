import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { WEEK_ONE_CHICAGO } from "@one-step-ahead/shared/season-one/seasonOne";
import type { app as expressApp } from "../src/index.js";
import type { pool as appPool } from "../src/db/pool.js";
import type { signSession as signSessionFn } from "../src/lib/session.js";
import type { weekRollover as weekRolloverFn, reconcileFinalizedWeek as reconcileFn } from "../src/services/weekRollover.js";
import type { createOrGetBingoCard as createCardFn } from "../src/services/bingoService.js";
import type { getSpecialOperationState as specialOpFn } from "../src/services/specialOperations.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

let app: typeof expressApp;
let pool: typeof appPool;
let signSession: typeof signSessionFn;
let weekRollover: typeof weekRolloverFn;
let reconcileFinalizedWeek: typeof reconcileFn;
let createOrGetBingoCard: typeof createCardFn;
let getSpecialOperationState: typeof specialOpFn;
let server: Server;
let baseUrl: string;

function cookieFor(userId: string): string {
  return `sc_session=${signSession({ user_id: userId })}`;
}

async function createUser(label: string, groupId: string): Promise<string> {
  const r = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id, fitbit_connected, last_synced_at)
     VALUES ($1, $2, $3, $4, TRUE, now())
     RETURNING id`,
    [`test-${label}`, `${label}@example.test`, `Player ${label}`, groupId],
  );
  return r.rows[0].id;
}

let seedCounter = 0;

async function seedChicagoWeek(): Promise<{
  groupId: string;
  weekId: string;
  userA: string;
  userB: string;
}> {
  seedCounter += 1;
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code) VALUES ('Week One Close', $1) RETURNING id`,
    [`WK${String(seedCounter).padStart(4, "0")}`],
  );
  const groupId = g.rows[0].id as string;
  const userA = await createUser(`close-a-${seedCounter}`, groupId);
  const userB = await createUser(`close-b-${seedCounter}`, groupId);
  const city = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const w = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, '2026-06-01', '2026-06-07', 140000)
     RETURNING id`,
    [groupId, city.rows[0].id],
  );
  return { groupId, weekId: w.rows[0].id, userA, userB };
}

/** Log the entire scenario total on Monday so no bonus system engages. */
async function logMondaySteps(userId: string, steps: number): Promise<void> {
  await pool.query(
    `INSERT INTO step_logs (user_id, log_date, steps) VALUES ($1, '2026-06-01', $2)
     ON CONFLICT (user_id, log_date) DO UPDATE SET steps = EXCLUDED.steps`,
    [userId, steps],
  );
}

describeDb("Week 1 case close integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL!);

    ({ app } = await import("../src/index.js"));
    ({ pool } = await import("../src/db/pool.js"));
    ({ signSession } = await import("../src/lib/session.js"));
    ({ weekRollover, reconcileFinalizedWeek } = await import("../src/services/weekRollover.js"));
    ({ createOrGetBingoCard } = await import("../src/services/bingoService.js"));
    ({ getSpecialOperationState } = await import("../src/services/specialOperations.js"));

    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await pool.end();
  });

  it.each([
    [97_999, "trail_lost"], // 0.69999… — just under the 70% boundary
    [98_000, "pursuit_maintained"], // exactly 70%
    [125_999, "pursuit_maintained"], // just under 90%
    [126_000, "close_encounter"], // exactly 90%
    [139_999, "close_encounter"], // just under 100%
    [140_000, "interception"], // exactly 100%
  ])("classifies %i steps against a 140k target as %s", async (steps, expected) => {
    const { weekId, userA } = await seedChicagoWeek();
    await logMondaySteps(userA, steps);

    await weekRollover(pool, weekId);

    const week = await pool.query(
      `SELECT final_outcome, final_progress, base_progress, remaining_lead,
              bonus_breakdown, data_confidence, finalized_at, season_id, season_week_number
       FROM weeks WHERE id = $1`,
      [weekId],
    );
    const row = week.rows[0];
    expect(row.final_outcome).toBe(expected);
    expect(row.season_id).toBe("season_one");
    expect(Number(row.season_week_number)).toBe(1);
    expect(Number(row.base_progress)).toBeCloseTo(steps / 140_000, 3);
    expect(Number(row.remaining_lead)).toBe(Math.max(0, Math.round(140_000 - steps)));
    expect(row.bonus_breakdown).toMatchObject({ total: 0 });
    expect(row.finalized_at).not.toBeNull();
    expect(row.data_confidence).toBe("verified");
  });

  it("unlocks standard evidence for every outcome and the Intercept Clue only on interception", async () => {
    const lost = await seedChicagoWeek();
    await logMondaySteps(lost.userA, 10_000);
    await weekRollover(pool, lost.weekId);
    const lostUnlocks = await pool.query(
      `SELECT evidence_id, kind, outcome FROM group_evidence_unlocks WHERE group_id = $1`,
      [lost.groupId],
    );
    expect(lostUnlocks.rowCount).toBe(1);
    expect(lostUnlocks.rows[0]).toMatchObject({
      evidence_id: "week01_brass_dial",
      kind: "standard",
      outcome: "trail_lost",
    });

    const intercepted = await seedChicagoWeek();
    await logMondaySteps(intercepted.userA, 150_000);
    await weekRollover(pool, intercepted.weekId);
    const interceptedUnlocks = await pool.query(
      `SELECT evidence_id, kind FROM group_evidence_unlocks WHERE group_id = $1 ORDER BY kind DESC`,
      [intercepted.groupId],
    );
    expect(interceptedUnlocks.rows.map((r) => r.evidence_id).sort()).toEqual([
      "week01_access_before_entry",
      "week01_brass_dial",
    ]);
  });

  it("rerunning rollover never duplicates evidence or the persisted result", async () => {
    const { groupId, weekId, userA } = await seedChicagoWeek();
    await logMondaySteps(userA, 150_000);

    await weekRollover(pool, weekId);
    await weekRollover(pool, weekId);

    const unlocks = await pool.query(
      `SELECT COUNT(*)::int AS n FROM group_evidence_unlocks WHERE group_id = $1`,
      [groupId],
    );
    expect(Number(unlocks.rows[0].n)).toBe(2); // brass dial + intercept clue, once each

    const weeks = await pool.query(
      `SELECT COUNT(*)::int AS n FROM weeks WHERE group_id = $1`,
      [groupId],
    );
    expect(Number(weeks.rows[0].n)).toBe(2); // closed week + next week only
  });

  it("late-sync reconciliation corrects the outcome without duplicating evidence or rewards", async () => {
    const { groupId, weekId, userA } = await seedChicagoWeek();
    await logMondaySteps(userA, 97_999);
    await weekRollover(pool, weekId);

    const before = await pool.query(
      `SELECT final_outcome, finalized_at FROM weeks WHERE id = $1`,
      [weekId],
    );
    expect(before.rows[0].final_outcome).toBe("trail_lost");
    const originalFinalizedAt = new Date(before.rows[0].finalized_at).toISOString();
    const badgesBefore = await pool.query(
      `SELECT COUNT(*)::int AS n FROM badges WHERE week_id = $1`,
      [weekId],
    );

    // A late Sunday sync lands Monday noon and flips the result.
    await pool.query(
      `INSERT INTO step_logs (user_id, log_date, steps) VALUES ($1, '2026-06-07', 45_000)`,
      [userA],
    );
    const first = await reconcileFinalizedWeek(pool, weekId);
    expect(first.outcomeChanged).toBe(true);

    const after = await pool.query(
      `SELECT final_outcome, finalized_at, group_total_steps, target_hit FROM weeks WHERE id = $1`,
      [weekId],
    );
    expect(after.rows[0].final_outcome).toBe("interception");
    expect(Number(after.rows[0].group_total_steps)).toBe(142_999);
    expect(after.rows[0].target_hit).toBe(true);
    // Reconciliation corrects the result; it does not re-finalize.
    expect(new Date(after.rows[0].finalized_at).toISOString()).toBe(originalFinalizedAt);

    // Evidence: intercept clue added, standard evidence not duplicated.
    const unlocks = await pool.query(
      `SELECT evidence_id, COUNT(*)::int AS n FROM group_evidence_unlocks
       WHERE group_id = $1 GROUP BY evidence_id ORDER BY evidence_id`,
      [groupId],
    );
    expect(unlocks.rows).toEqual([
      { evidence_id: "week01_access_before_entry", n: 1 },
      { evidence_id: "week01_brass_dial", n: 1 },
    ]);

    // Rewards untouched — reconciliation never re-awards badges.
    const badgesAfter = await pool.query(
      `SELECT COUNT(*)::int AS n FROM badges WHERE week_id = $1`,
      [weekId],
    );
    expect(Number(badgesAfter.rows[0].n)).toBe(Number(badgesBefore.rows[0].n));

    // Trust beat fired once; rerunning reconciliation with no new data is a no-op.
    const second = await reconcileFinalizedWeek(pool, weekId);
    expect(second.outcomeChanged).toBe(false);
    const beats = await pool.query(
      `SELECT COUNT(*)::int AS n
       FROM beat_events be JOIN beat_definitions bd ON bd.id = be.beat_id
       WHERE bd.slug = 'result_recalculating' AND be.group_id = $1`,
      [groupId],
    );
    expect(Number(beats.rows[0].n)).toBe(1);
  });

  it("deals the fixed Week 1 Chicago board and leaves other weeks on the random pool", async () => {
    const { groupId, weekId, userA } = await seedChicagoWeek();
    const card = await createOrGetBingoCard(pool, weekId, userA);
    const challengeIds = card.tiles
      .filter((tile): tile is Extract<(typeof card.tiles)[number], { challenge_id: number }> => "challenge_id" in tile)
      .map((tile) => tile.challenge_id);
    expect(challengeIds).toHaveLength(24);

    const codes = await pool.query(
      `SELECT code FROM bingo_challenge_definitions WHERE id = ANY($1)`,
      [challengeIds],
    );
    expect(codes.rows.map((row) => row.code).sort()).toEqual(
      [...WEEK_ONE_CHICAGO.fieldOps.fixedChallengeCodes].sort(),
    );

    // A Detroit week (structural config, no fixed codes) uses the full pool.
    const detroit = await pool.query(`SELECT id FROM cities WHERE route_order = 2`);
    const w2 = await pool.query(
      `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps, status)
       VALUES ($1, $2, '2026-06-08', '2026-06-14', 140000, 'scheduled') RETURNING id`,
      [groupId, detroit.rows[0].id],
    );
    const detroitCard = await createOrGetBingoCard(pool, w2.rows[0].id, userA);
    expect(detroitCard.tiles).toHaveLength(25);
  });

  it("computes Platform Sweep tiers from Friday/Saturday verified steps", async () => {
    const { groupId, weekId, userA, userB } = await seedChicagoWeek();
    const userC = await createUser("close-c-extra", groupId);

    // Friday 2026-06-05, Saturday 2026-06-06. A and B contribute; C does not.
    await pool.query(
      `INSERT INTO step_logs (user_id, log_date, steps) VALUES
       ($1, '2026-06-05', 1500), ($1, '2026-06-06', 700),
       ($2, '2026-06-05', 2400),
       ($3, '2026-06-05', 1999)`,
      [userA, userB, userC],
    );

    const friday = await getSpecialOperationState(pool, weekId, "2026-06-05");
    expect(friday.active).toBe(true);
    expect(friday.contributors).toBe(2); // A: 2200 across the window, B: 2400
    expect(friday.eligiblePlayers).toBe(3);
    expect(friday.earnedBonus).toBe(0.02); // 2/3 = 66% → 60% tier

    const monday = await getSpecialOperationState(pool, weekId, "2026-06-01");
    expect(monday.active).toBe(false);
  });

  it("records ritual views and reflects them in the current-week payload", async () => {
    const { weekId, userA } = await seedChicagoWeek();

    const view = await fetch(`${baseUrl}/api/rituals/view`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieFor(userA) },
      body: JSON.stringify({ week_id: weekId, ritual_id: "monday_briefing" }),
    });
    expect(view.status).toBe(200);
    // Idempotent re-view.
    const again = await fetch(`${baseUrl}/api/rituals/view`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieFor(userA) },
      body: JSON.stringify({ week_id: weekId, ritual_id: "monday_briefing" }),
    });
    expect(again.status).toBe(200);

    const rows = await pool.query(
      `SELECT COUNT(*)::int AS n FROM week_ritual_views WHERE week_id = $1 AND user_id = $2`,
      [weekId, userA],
    );
    expect(Number(rows.rows[0].n)).toBe(1);

    const current = await fetch(`${baseUrl}/api/weeks/current`, {
      headers: { cookie: cookieFor(userA) },
    });
    const body = await current.json();
    expect(body.seasonState.ritualViews).toMatchObject({
      mondayBriefing: true,
      midweekUpdate: false,
      finalPush: false,
      caseClosed: false,
    });
    expect(body.seasonState.platformSweep).toMatchObject({ id: "platform_sweep" });
    expect(body.seasonState.evidencePreview).toMatchObject({
      standardEvidenceId: "week01_brass_dial",
      unlocked: false,
      interceptUnlocked: false,
    });
    expect(body.seasonState.primaryBeat).toMatchObject({ id: expect.any(String) });
  });

  it("rejects ritual views for weeks outside the viewer's group", async () => {
    const mine = await seedChicagoWeek();
    const theirs = await seedChicagoWeek();
    const res = await fetch(`${baseUrl}/api/rituals/view`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieFor(mine.userA) },
      body: JSON.stringify({ week_id: theirs.weekId, ritual_id: "monday_briefing" }),
    });
    expect(res.status).toBe(404);
  });

  it("serves the group-scoped evidence board with locked slots hiding content", async () => {
    const { weekId, userA } = await seedChicagoWeek();
    const outsider = await seedChicagoWeek();

    const before = await fetch(`${baseUrl}/api/evidence`, {
      headers: { cookie: cookieFor(userA) },
    });
    expect(before.status).toBe(200);
    const boardBefore = await before.json();
    expect(boardBefore.weeks).toHaveLength(13);
    expect(boardBefore.interceptionCount).toBe(0);
    expect(boardBefore.finaleDepthTier).toBe(1);
    expect(boardBefore.weeks[0].standardEvidence).toMatchObject({
      unlocked: false,
      body: null,
      title: "SEALED EVIDENCE",
    });

    await logMondaySteps(userA, 150_000);
    await weekRollover(pool, weekId);

    const after = await fetch(`${baseUrl}/api/evidence`, {
      headers: { cookie: cookieFor(userA) },
    });
    const board = await after.json();
    expect(board.weeks[0]).toMatchObject({
      weekNumber: 1,
      cityName: "Chicago",
      outcome: "interception",
      standardEvidence: { unlocked: true, title: "THE BRASS DIAL" },
      interceptClue: { unlocked: true, title: "ACCESS BEFORE ENTRY" },
    });
    expect(board.interceptionCount).toBe(1);
    expect(board.weeks[1].standardEvidence.unlocked).toBe(false);

    // The other group's board is untouched.
    const other = await fetch(`${baseUrl}/api/evidence`, {
      headers: { cookie: cookieFor(outsider.userA) },
    });
    const otherBoard = await other.json();
    expect(otherBoard.weeks[0].standardEvidence.unlocked).toBe(false);
  });

  it("returns the previous case with outcome copy keys after rollover", async () => {
    const { weekId, userA } = await seedChicagoWeek();
    await logMondaySteps(userA, 130_000);
    await weekRollover(pool, weekId);

    const current = await fetch(`${baseUrl}/api/weeks/current`, {
      headers: { cookie: cookieFor(userA) },
    });
    const body = await current.json();
    // The new active week is Detroit (week 2); the finished Chicago case
    // rides along until the viewer dismisses the Case Closed report.
    expect(body.seasonState.season.weekNumber).toBe(2);
    expect(body.seasonState.previousCase).toMatchObject({
      weekNumber: 1,
      cityName: "Chicago",
      outcome: "close_encounter",
      viewed: false,
    });
    // The new chapter's unviewed briefing outranks the case result in the
    // approved primary-action priority list (2 vs 3).
    expect(body.seasonState.primaryAction.id).toBe("view_briefing");

    // Once the briefing is dismissed, the case result takes over.
    const nextWeekId = body.week.id as string;
    await fetch(`${baseUrl}/api/rituals/view`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieFor(userA) },
      body: JSON.stringify({ week_id: nextWeekId, ritual_id: "monday_briefing" }),
    });
    const afterBriefing = await fetch(`${baseUrl}/api/weeks/current`, {
      headers: { cookie: cookieFor(userA) },
    });
    const afterBody = await afterBriefing.json();
    expect(afterBody.seasonState.primaryAction.id).toBe("view_case_result");
  });
});
