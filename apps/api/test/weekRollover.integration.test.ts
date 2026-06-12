import { readFile } from "node:fs/promises";
import pg from "pg";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import type { pool as appPool } from "../src/db/pool.js";
import type { weekRollover as weekRolloverFn } from "../src/services/weekRollover.js";
import type { pairAndPersist as pairAndPersistFn } from "../src/services/nemesisService.js";
import type { createOrGetBingoCard as createCardFn } from "../src/services/bingoService.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type Pool = typeof appPool;

let pool: Pool;
let weekRollover: typeof weekRolloverFn;
let pairAndPersist: typeof pairAndPersistFn;
let createOrGetBingoCard: typeof createCardFn;

async function resetDatabase(connectionString: string): Promise<void> {
  const resetPool = new pg.Pool({ connectionString });
  try {
    await resetPool.query("DROP SCHEMA public CASCADE");
    await resetPool.query("CREATE SCHEMA public");
    await resetPool.query(
      await readFile(new URL("../src/db/migrations/001_init.sql", import.meta.url), "utf8"),
    );
    await resetPool.query(
      await readFile(new URL("../src/db/migrations/002_seed_cities.sql", import.meta.url), "utf8"),
    );
  } finally {
    await resetPool.end();
  }
}

async function createUser(label: string, groupId: string | null): Promise<string> {
  const r = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [`test-${label}`, `${label}@example.test`, `Player ${label}`, groupId],
  );
  return r.rows[0].id;
}

async function seedGroupWeek(): Promise<{
  groupId: string;
  weekId: string;
  userA: string;
  userB: string;
  startsOn: string;
}> {
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code) VALUES ('Rollover Test', 'ABCDEF') RETURNING id`,
  );
  const groupId = g.rows[0].id as string;
  const userA = await createUser("alice", groupId);
  const userB = await createUser("bob", groupId);

  const city = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const w = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, '2026-06-01', '2026-06-07', 140000)
     RETURNING id, to_char(starts_on, 'YYYY-MM-DD') AS starts_on`,
    [groupId, city.rows[0].id],
  );
  return {
    groupId,
    weekId: w.rows[0].id,
    userA,
    userB,
    startsOn: w.rows[0].starts_on,
  };
}

describeDb("weekRollover integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL!);

    ({ pool } = await import("../src/db/pool.js"));
    ({ weekRollover } = await import("../src/services/weekRollover.js"));
    ({ pairAndPersist } = await import("../src/services/nemesisService.js"));
    ({ createOrGetBingoCard } = await import("../src/services/bingoService.js"));
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("closes the week, awards badges, freezes bingo, and opens the next week", async () => {
    const { groupId, weekId, userA, userB } = await seedGroupWeek();

    // Alice out-steps Bob every day and hits the group target alone.
    await pool.query(
      `INSERT INTO step_logs (user_id, log_date, steps)
       SELECT $1, d::date, 21000 FROM generate_series('2026-06-01'::date, '2026-06-07'::date, '1 day') d`,
      [userA],
    );
    await pool.query(
      `INSERT INTO step_logs (user_id, log_date, steps)
       SELECT $1, d::date, 5000 FROM generate_series('2026-06-01'::date, '2026-06-07'::date, '1 day') d`,
      [userB],
    );
    await pool.query(
      `INSERT INTO predictions (week_id, user_id, predicted_steps) VALUES ($1, $2, 180000)`,
      [weekId, userA],
    );
    await pairAndPersist(pool, weekId, groupId);
    await createOrGetBingoCard(pool, weekId, userA);

    const { nextWeekId } = await weekRollover(pool, weekId);

    const week = await pool.query(`SELECT status, target_hit FROM weeks WHERE id = $1`, [weekId]);
    expect(week.rows[0].status).toBe("closed");
    expect(week.rows[0].target_hit).toBe(true);

    // City badge to the step leader; perfect week too (21000 > 70000/7).
    const badges = await pool.query(
      `SELECT badge_code, quality FROM badges WHERE user_id = $1 AND week_id = $2 ORDER BY badge_code`,
      [userA, weekId],
    );
    const codes = badges.rows.map((r) => r.badge_code);
    expect(codes).toContain("city");
    expect(codes).toContain("prediction_win");
    expect(codes).toContain("perfect_week");
    expect(badges.rows.find((r) => r.badge_code === "city")!.quality).toBe("bronze");

    // Nemesis finalized with a winner (Alice swept Mon–Fri).
    const matchup = await pool.query(
      `SELECT status, winner_id, score_a, score_b FROM nemesis_matchups WHERE week_id = $1`,
      [weekId],
    );
    expect(matchup.rows[0].status).toBe("complete");
    expect(matchup.rows[0].winner_id).toBe(userA);

    // Bingo frozen.
    const card = await pool.query(`SELECT frozen FROM bingo_cards WHERE week_id = $1`, [weekId]);
    expect(card.rows[0].frozen).toBe(true);

    // Next week exists, active, next city, fresh cards + pairings.
    const next = await pool.query(
      `SELECT w.status, to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on, c.route_order
       FROM weeks w JOIN cities c ON c.id = w.city_id WHERE w.id = $1`,
      [nextWeekId],
    );
    expect(next.rows[0].status).toBe("active");
    expect(next.rows[0].starts_on).toBe("2026-06-08");
    expect(Number(next.rows[0].route_order)).toBe(2);

    const nextCards = await pool.query(
      `SELECT COUNT(*)::int AS n FROM bingo_cards WHERE week_id = $1`,
      [nextWeekId],
    );
    expect(Number(nextCards.rows[0].n)).toBe(2);
    const nextMatchups = await pool.query(
      `SELECT COUNT(*)::int AS n FROM nemesis_matchups WHERE week_id = $1`,
      [nextWeekId],
    );
    expect(Number(nextMatchups.rows[0].n)).toBe(1);
  });

  it("is idempotent: rerunning does not duplicate badges, weeks, cards, or matchups", async () => {
    const { groupId, weekId, userA } = await seedGroupWeek();
    await pool.query(
      `INSERT INTO step_logs (user_id, log_date, steps)
       SELECT $1, d::date, 21000 FROM generate_series('2026-06-01'::date, '2026-06-07'::date, '1 day') d`,
      [userA],
    );
    await pairAndPersist(pool, weekId, groupId);

    const first = await weekRollover(pool, weekId);
    const second = await weekRollover(pool, weekId);
    expect(second.nextWeekId).toBe(first.nextWeekId);

    const badgeCount = await pool.query(
      `SELECT badge_code, COUNT(*)::int AS n FROM badges WHERE week_id = $1 GROUP BY badge_code`,
      [weekId],
    );
    for (const r of badgeCount.rows) expect(Number(r.n)).toBe(1);

    const weekCount = await pool.query(
      `SELECT COUNT(*)::int AS n FROM weeks WHERE group_id = $1`,
      [groupId],
    );
    expect(Number(weekCount.rows[0].n)).toBe(2);
  });

  it("wraps the city route after the last city", async () => {
    const { groupId, weekId } = await seedGroupWeek();
    const lastCity = await pool.query(
      `SELECT id FROM cities ORDER BY route_order DESC LIMIT 1`,
    );
    await pool.query(`UPDATE weeks SET city_id = $2 WHERE id = $1`, [weekId, lastCity.rows[0].id]);

    const { nextWeekId } = await weekRollover(pool, weekId);
    const next = await pool.query(
      `SELECT c.route_order FROM weeks w JOIN cities c ON c.id = w.city_id WHERE w.id = $1`,
      [nextWeekId],
    );
    expect(Number(next.rows[0].route_order)).toBe(1);
  });
});
