import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import type { pool as appPool } from "../src/db/pool.js";
import type {
  processScoutTokens as processFn,
  getReconCity as reconFn,
  giftTile as giftFn,
  honorComplete as honorFn,
} from "../src/services/scoutService.js";
import type { createOrGetBingoCard as createCardFn } from "../src/services/bingoService.js";
import type { BingoTile } from "@one-step-ahead/shared";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type Pool = typeof appPool;

let pool: Pool;
let processScoutTokens: typeof processFn;
let getReconCity: typeof reconFn;
let giftTile: typeof giftFn;
let honorComplete: typeof honorFn;
let createOrGetBingoCard: typeof createCardFn;

async function createUser(label: string, groupId: string | null): Promise<string> {
  const r = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [`test-${label}`, `${label}@example.test`, `Player ${label}`, groupId],
  );
  return r.rows[0].id;
}

async function seed(memberCount = 3) {
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code) VALUES ('Scout Test', 'SCOUT1') RETURNING id`,
  );
  const groupId = g.rows[0].id as string;
  const users: string[] = [];
  for (let i = 0; i < memberCount; i++) users.push(await createUser(`scout${i}`, groupId));
  const city = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const w = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, '2026-06-01', '2026-06-07', 140000) RETURNING id`,
    [groupId, city.rows[0].id],
  );
  return { groupId, weekId: w.rows[0].id as string, users };
}

/** Force a user's card to `lines` bingo lines (marks up to 5 rows of tiles;
    the token math reads bingo_cards.bingo_lines, which is set exactly). */
async function setLines(weekId: string, userId: string, lines: number): Promise<void> {
  const card = await createOrGetBingoCard(pool, weekId, userId);
  const tiles: BingoTile[] = card.tiles.map((t) => ({ ...t }));
  for (let row = 0; row < Math.min(5, lines); row++) {
    for (let col = 0; col < 5; col++) {
      const t = tiles[row * 5 + col];
      if ("challenge_id" in t) tiles[row * 5 + col] = { ...t, state: "complete" };
    }
  }
  await pool.query(
    `UPDATE bingo_cards SET tiles = $1, bingo_lines = $2 WHERE week_id = $3 AND user_id = $4`,
    [JSON.stringify(tiles), lines, weekId, userId],
  );
}

async function unlockedLandmarks(weekId: string): Promise<{ triggering_user: string; unlock_date: string }[]> {
  const r = await pool.query(
    `SELECT triggering_user, to_char(unlock_date, 'YYYY-MM-DD') AS unlock_date
     FROM city_unlocks WHERE week_id = $1 AND unlocked ORDER BY unlocked_at`,
    [weekId],
  );
  return r.rows;
}

describeDb("M10 scout-token economy", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);
    await resetDatabase(TEST_DATABASE_URL!);
    ({ pool } = await import("../src/db/pool.js"));
    ({ processScoutTokens, getReconCity, giftTile, honorComplete } = await import(
      "../src/services/scoutService.js"
    ));
    ({ createOrGetBingoCard } = await import("../src/services/bingoService.js"));
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("recon city is one ahead on the route", async () => {
    const { weekId } = await seed();
    const recon = await getReconCity(pool, weekId);
    const cur = await pool.query(`SELECT route_order FROM cities WHERE route_order = 1`);
    expect(recon).not.toBeNull();
    expect(recon!.route_order).toBe(cur.rows[0].route_order + 1);
  });

  it("weekly cards are a shared base across teammates", async () => {
    const { weekId, users } = await seed(3);
    const [a, b] = await Promise.all([
      createOrGetBingoCard(pool, weekId, users[0]),
      createOrGetBingoCard(pool, weekId, users[1]),
    ]);
    const ids = (tiles: BingoTile[]) =>
      tiles.map((t) => ("challenge_id" in t ? t.challenge_id : "free"));
    expect(ids(a.tiles)).toEqual(ids(b.tiles));
  });

  it("accessibility prefs substitute excluded categories only", async () => {
    const { weekId, users } = await seed(3);
    await pool.query(`UPDATE users SET objective_prefs = '{"strength": false}' WHERE id = $1`, [
      users[0],
    ]);
    const card = await createOrGetBingoCard(pool, weekId, users[0]);
    const catRows = await pool.query(`SELECT id, category FROM bingo_challenge_definitions`);
    const catById = new Map<number, string>(catRows.rows.map((r) => [Number(r.id), r.category]));
    for (const t of card.tiles) {
      if ("challenge_id" in t) expect(catById.get(t.challenge_id)).not.toBe("strength");
    }
  });

  it("paces unlocks to one per day and caps per-player credit", async () => {
    const { groupId, weekId, users } = await seed(3);
    // Player 0 has 5 lines — plenty of tokens.
    await setLines(weekId, users[0], 5);

    // Day 1: one unlock, no more (pacing).
    await processScoutTokens(pool, weekId, groupId, users[0], "2026-06-01");
    await processScoutTokens(pool, weekId, groupId, users[0], "2026-06-01");
    expect(await unlockedLandmarks(weekId)).toHaveLength(1);

    // Day 2: second unlock for the same player.
    await processScoutTokens(pool, weekId, groupId, users[0], "2026-06-02");
    expect(await unlockedLandmarks(weekId)).toHaveLength(2);

    // Day 3: player 0 is at the cap (2 for a 3-person group) — no unlock.
    await processScoutTokens(pool, weekId, groupId, users[0], "2026-06-03");
    expect(await unlockedLandmarks(weekId)).toHaveLength(2);

    // A teammate's line can keep the trail moving.
    await setLines(weekId, users[1], 2);
    await processScoutTokens(pool, weekId, groupId, users[1], "2026-06-03");
    const after = await unlockedLandmarks(weekId);
    expect(after).toHaveLength(3);
    expect(after[2].triggering_user).toBe(users[1]);
  });

  it("scout keeps the intel card; overflow counts beyond 5", async () => {
    const { groupId, weekId, users } = await seed(3);
    await setLines(weekId, users[0], 7); // 7 tokens → 2 overflow once trail is done
    const state = await processScoutTokens(pool, weekId, groupId, users[0], "2026-06-01");
    expect(state.unlockedCount).toBe(1);
    expect(state.overflowBonus).toBe(2);
    const cards = await pool.query(`SELECT user_id, variant FROM intel_cards WHERE week_id = $1`, [
      weekId,
    ]);
    expect(cards.rowCount).toBe(1);
    expect(cards.rows[0]).toMatchObject({ user_id: users[0], variant: "scouted" });
  });

  it("gift-a-tile: 2/week, only tiles the giver completed", async () => {
    const { groupId, weekId, users } = await seed(3);
    const giver = await createOrGetBingoCard(pool, weekId, users[0]);
    await createOrGetBingoCard(pool, weekId, users[1]);

    // find three non-free challenge ids on the shared card
    const ids = giver.tiles
      .filter((t): t is Extract<BingoTile, { challenge_id: number }> => "challenge_id" in t)
      .map((t) => t.challenge_id);

    // Giver hasn't completed anything → refused.
    const refused = await giftTile(pool, weekId, groupId, users[0], users[1], ids[0], "2026-06-02");
    expect(refused).toMatchObject({ ok: false, code: "NOT_COMPLETED" });

    // Complete giver's first row (covers ids of that row).
    await setLines(weekId, users[0], 1);
    const rowIds = giver.tiles
      .slice(0, 5)
      .filter((t): t is Extract<BingoTile, { challenge_id: number }> => "challenge_id" in t)
      .map((t) => t.challenge_id);

    expect(await giftTile(pool, weekId, groupId, users[0], users[1], rowIds[0], "2026-06-02")).toMatchObject({ ok: true });
    expect(await giftTile(pool, weekId, groupId, users[0], users[1], rowIds[1], "2026-06-02")).toMatchObject({ ok: true });
    // third assist refused (2/week)
    expect(await giftTile(pool, weekId, groupId, users[0], users[1], rowIds[2], "2026-06-02")).toMatchObject({
      ok: false,
      code: "ASSISTS_SPENT",
    });

    // Recipient's tile is marked with provenance.
    const recip = await pool.query(
      `SELECT tiles FROM bingo_cards WHERE week_id = $1 AND user_id = $2`,
      [weekId, users[1]],
    );
    const gifted = (recip.rows[0].tiles as BingoTile[]).filter(
      (t) => "challenge_id" in t && t.gifted_by === users[0],
    );
    expect(gifted).toHaveLength(2);
  });

  it("honor completion only works for honor-source tiles", async () => {
    const { groupId, weekId, users } = await seed(3);
    const card = await createOrGetBingoCard(pool, weekId, users[0]);
    const defs = await pool.query(`SELECT id, source FROM bingo_challenge_definitions`);
    const srcById = new Map<number, string>(defs.rows.map((r) => [Number(r.id), r.source]));
    const tiles = card.tiles.filter(
      (t): t is Extract<BingoTile, { challenge_id: number }> => "challenge_id" in t,
    );
    const honorTile = tiles.find((t) => srcById.get(t.challenge_id) === "honor");
    const autoTile = tiles.find((t) => srcById.get(t.challenge_id) === "auto");

    if (autoTile) {
      const refused = await honorComplete(
        pool, weekId, groupId, users[0], autoTile.challenge_id, "2026-06-01",
      );
      expect(refused).toMatchObject({ ok: false, code: "NOT_HONOR" });
    }
    if (honorTile) {
      const done = await honorComplete(
        pool, weekId, groupId, users[0], honorTile.challenge_id, "2026-06-01", "Pilates class",
      );
      expect(done).toMatchObject({ ok: true });
      const after = await pool.query(
        `SELECT tiles FROM bingo_cards WHERE week_id = $1 AND user_id = $2`,
        [weekId, users[0]],
      );
      const t = (after.rows[0].tiles as BingoTile[]).find(
        (x) => "challenge_id" in x && x.challenge_id === honorTile.challenge_id,
      ) as Extract<BingoTile, { challenge_id: number }>;
      expect(t.state).toBe("complete");
      expect(t.honor).toBe(true);
      expect(t.honor_note).toBe("Pilates class");
    }
    expect(honorTile, "shared card should include at least one honor tile").toBeTruthy();
  });
});
