import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { calculateChase } from "@one-step-ahead/shared/season-one/chase";
import { calculateWeeklyPhase } from "@one-step-ahead/shared/season-one/weeklyPhase";
import type { app as expressApp } from "../src/index.js";
import type { pool as appPool } from "../src/db/pool.js";
import type { signSession as signSessionFn } from "../src/lib/session.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type App = typeof expressApp;
type Pool = typeof appPool;
type SignSession = typeof signSessionFn;

let app: App;
let pool: Pool;
let signSession: SignSession;
let server: Server;
let baseUrl: string;

function cookieFor(userId: string): string {
  return `sc_session=${signSession({ user_id: userId })}`;
}

async function createUser(label: string): Promise<string> {
  const r = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, fitbit_connected)
     VALUES ($1, $2, $3, TRUE)
     RETURNING id`,
    [`test-${label}`, `${label}@example.test`, `Player ${label}`],
  );
  return r.rows[0].id;
}

async function request(userId: string, path: string): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    headers: { cookie: cookieFor(userId) },
  });
}

async function createGroup(ownerId: string) {
  const res = await fetch(`${baseUrl}/api/groups`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieFor(ownerId) },
    body: JSON.stringify({ name: "Week One Testers" }),
  });
  expect(res.status).toBe(201);
  return (await res.json()).group as { id: string };
}

describeDb("current week route integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL);

    ({ app } = await import("../src/index.js"));
    ({ pool } = await import("../src/db/pool.js"));
    ({ signSession } = await import("../src/lib/session.js"));

    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
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

  it("extends current Chicago week with authoritative Week 1 season state", async () => {
    const ownerId = await createUser("owner");
    const group = await createGroup(ownerId);
    const staleId = await createUser("stale");
    const missingId = await createUser("missing");
    await pool.query("UPDATE users SET group_id = $1 WHERE id IN ($2, $3)", [group.id, staleId, missingId]);
    await pool.query(
      `UPDATE users
       SET last_synced_at = CASE
         WHEN id = $1 THEN now()
         WHEN id = $2 THEN now() - INTERVAL '25 hours'
         ELSE NULL
       END
       WHERE id IN ($1, $2, $3)`,
      [ownerId, staleId, missingId],
    );

    const week = await pool.query(
      `UPDATE weeks
       SET group_target_steps = 100000
       WHERE group_id = $1 AND status = 'active'
       RETURNING id, starts_on, ends_on`,
      [group.id],
    );
    const weekRow = week.rows[0];
    await pool.query(
      `INSERT INTO step_logs (user_id, log_date, steps)
       VALUES ($1, $3, 60000), ($2, $3, 50000)`,
      [ownerId, staleId, weekRow.starts_on],
    );
    for (const userId of [ownerId, staleId, missingId]) {
      await pool.query(
        `INSERT INTO predictions (week_id, user_id, predicted_steps)
         VALUES ($1, $2, 100000)`,
        [weekRow.id, userId],
      );
    }

    const response = await request(ownerId, "/api/weeks/current");
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toMatchObject({
      week: { id: weekRow.id, group_target_steps: 100000, status: "active" },
      city: { name: "Chicago" },
      route: expect.any(Array),
      progressStrip: expect.any(Array),
      leaderboard: expect.any(Array),
      state: expect.any(String),
    });
    expect(body.seasonState).toMatchObject({
      season: { id: "season_one", title: "The Lakefront Job", weekNumber: 1, totalWeeks: 13 },
      chapter: { city: "Chicago", title: "The Lakefront Job", complication: "Cold Start", nextCity: "Detroit" },
      dataConfidence: "incomplete",
      sync: { incompletePlayerCount: 2, stalePlayerCount: 1 },
      primaryAction: { id: "fix_sync", priority: 1 },
    });

    const expectedChase = calculateChase({
      activePlayers: [
        { userId: ownerId, weeklyTarget: 70000, stepsThisWeek: 60000, lastSyncedAt: new Date(), fitbitConnected: true },
        { userId: staleId, weeklyTarget: 70000, stepsThisWeek: 50000, lastSyncedAt: new Date(), fitbitConnected: true },
        { userId: missingId, weeklyTarget: 70000, stepsThisWeek: 0, lastSyncedAt: null, fitbitConnected: true },
      ],
      fieldOps: { activePlayerCount: 3, totalQualifyingLines: 0 },
      specialOperation: { maxBonus: 0.03, earnedBonus: 0, contributors: 0, eligiblePlayers: 3 },
      nemesis: { activePlayerCount: 3, participantsWithActivity: 2, allMatchupsResolved: false },
      prediction: { activePlayerCount: 3, submittedCount: 3 },
      trackerSync: [
        { userId: ownerId, freshness: "current" },
        { userId: staleId, freshness: "stale" },
        { userId: missingId, freshness: "missing" },
      ],
      elapsedFractionOfWeek: 1,
      now: new Date(),
      groupWeeklyTargetSnapshot: 100000,
      dataConfidence: "incomplete",
    });
    expect(body.seasonState.chase).toMatchObject({
      verifiedGroupSteps: expectedChase.verifiedGroupSteps,
      snapshottedTarget: expectedChase.groupWeeklyTarget,
      baseProgress: expectedChase.baseProgress,
      predictionParticipationBonus: expectedChase.bonuses.predictionParticipation,
      totalNonStepBonus: expectedChase.bonuses.total,
      finalProgress: expectedChase.finalProgress,
      remainingLead: 0,
      projectedOutcome: null,
      finalOutcome: null,
    });
    expect(body.selenaLeadSteps).toBe(body.seasonState.chase.remainingLead);

    const phase = calculateWeeklyPhase({
      startsOn: weekRow.starts_on,
      endsOn: weekRow.ends_on,
      timezone: "America/Chicago",
      weekStatus: "active",
      finalOutcome: null,
      finalizedAt: null,
      dataConfidence: "incomplete",
      briefingViewed: true,
      midweekViewed: true,
      finalPushViewed: true,
      caseClosedViewed: true,
      suddenDeathActive: false,
      now: new Date(),
    }).phase;
    expect(body.seasonState.phase).toBe(phase);
  });

  it("does not assign Season One config to a legacy city mismatch", async () => {
    const ownerId = await createUser("legacy-owner");
    const group = await createGroup(ownerId);
    // 009 seeds the full Season One route, so a mismatch now means a city
    // whose name no longer matches the config at its route position.
    const legacyCity = await pool.query(
      `INSERT INTO cities (route_order, name, country, lat, lng)
       VALUES (99, 'Reykjavik', 'Iceland', 64.14660, -21.94260)
       RETURNING id`,
    );
    await pool.query(
      `UPDATE weeks SET city_id = $2 WHERE group_id = $1 AND status = 'active'`,
      [group.id, legacyCity.rows[0].id],
    );

    const response = await request(ownerId, "/api/weeks/current");
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.city.route_order).toBe(99);
    expect(body.seasonState).toBeNull();
    expect(body.week).not.toBeNull();
    expect(body.leaderboard).toEqual(expect.any(Array));

    await pool.query(`DELETE FROM weeks WHERE city_id = $1`, [legacyCity.rows[0].id]);
    await pool.query(`DELETE FROM cities WHERE id = $1`, [legacyCity.rows[0].id]);
  });
});
