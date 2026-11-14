import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import type { pool as appPool } from "../src/db/pool.js";
import type {
  createOrGetBingoCard as createCardFn,
  updateBingoCard as updateCardFn,
} from "../src/services/bingoService.js";
import type { BingoTile } from "@one-step-ahead/shared";

// Time-of-day bingo tiles end to end through the real SQL context: stored
// workout starts and bedtimes are UTC instants (what the Health API returns)
// and must be judged on the GROUP's wall clock, not the UTC hour.

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type Pool = typeof appPool;
let pool: Pool;
let createOrGetBingoCard: typeof createCardFn;
let updateBingoCard: typeof updateCardFn;

const CODES = ["workout_before_8", "bed_before_11_x2"] as const;

async function seed(timezone: string, startsOn: string, endsOn: string) {
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code, timezone) VALUES ('TZ Test', 'TZTEST', $1) RETURNING id`,
    [timezone],
  );
  const u = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id)
     VALUES ('test-tz', 'tz@example.test', 'Player TZ', $1) RETURNING id`,
    [g.rows[0].id],
  );
  const city = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const w = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, $3, $4, 140000) RETURNING id`,
    [g.rows[0].id, city.rows[0].id, startsOn, endsOn],
  );
  const weekId = w.rows[0].id as string;
  const userId = u.rows[0].id as string;

  await createOrGetBingoCard(pool, weekId, userId);
  const targets = await pool.query(
    `SELECT id, code FROM bingo_challenge_definitions WHERE code = ANY($1)`,
    [CODES as unknown as string[]],
  );
  expect(targets.rowCount).toBe(CODES.length);
  const byCode = new Map<string, number>(targets.rows.map((r) => [r.code, Number(r.id)]));
  const fillers = await pool.query(
    `SELECT id FROM bingo_challenge_definitions WHERE NOT (code = ANY($1)) ORDER BY id LIMIT 22`,
    [CODES as unknown as string[]],
  );
  const ids = [...byCode.values(), ...fillers.rows.map((r) => Number(r.id))];
  const tiles: BingoTile[] = ids.map((id) => ({ challenge_id: id, state: "incomplete" as const }));
  tiles.splice(12, 0, { free: true, state: "complete" });
  await pool.query(`UPDATE bingo_cards SET tiles = $1 WHERE week_id = $2 AND user_id = $3`, [
    JSON.stringify(tiles),
    weekId,
    userId,
  ]);
  return { weekId, userId, byCode };
}

async function log(
  userId: string,
  date: string,
  f: { workoutStart?: string; bedtime?: string },
): Promise<void> {
  await pool.query(
    `INSERT INTO step_logs (user_id, log_date, steps, workouts, sleep_minutes, bedtime)
     VALUES ($1, $2, 6000, $3, 440, $4)`,
    [
      userId,
      date,
      JSON.stringify(
        f.workoutStart
          ? [{ type: "run", start: f.workoutStart, duration_min: 30, zone_min: 10 }]
          : [],
      ),
      f.bedtime ?? null,
    ],
  );
}

async function state(weekId: string, userId: string, id: number): Promise<string> {
  const r = await pool.query(`SELECT tiles FROM bingo_cards WHERE week_id = $1 AND user_id = $2`, [
    weekId,
    userId,
  ]);
  const tiles: BingoTile[] = r.rows[0].tiles;
  return tiles.find((t) => "challenge_id" in t && t.challenge_id === id)?.state ?? "missing";
}

describeDb("bingo time-of-day tiles use the group's wall clock", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);
    await resetDatabase(TEST_DATABASE_URL!);
    ({ pool } = await import("../src/db/pool.js"));
    ({ createOrGetBingoCard, updateBingoCard } = await import("../src/services/bingoService.js"));
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("Chicago (CDT): 7:30 AM workout completes 'before 8am'", async () => {
    const { weekId, userId, byCode } = await seed("America/Chicago", "2026-06-01", "2026-06-07");
    await log(userId, "2026-06-03", { workoutStart: "2026-06-03T12:30:00Z" });
    await updateBingoCard(pool, weekId, userId, "2026-06-03");
    expect(await state(weekId, userId, byCode.get("workout_before_8")!)).toBe("complete");
  });

  it("Chicago (CDT): 7:30 PM workout (00:30 UTC) does NOT complete 'before 8am'", async () => {
    const { weekId, userId, byCode } = await seed("America/Chicago", "2026-06-01", "2026-06-07");
    await log(userId, "2026-06-03", { workoutStart: "2026-06-04T00:30:00Z" });
    await updateBingoCard(pool, weekId, userId, "2026-06-03");
    expect(await state(weekId, userId, byCode.get("workout_before_8")!)).toBe("incomplete");
  });

  it("Chicago (CST): 7:30 AM passes, 8:15 AM fails", async () => {
    const a = await seed("America/Chicago", "2026-11-09", "2026-11-15");
    await log(a.userId, "2026-11-10", { workoutStart: "2026-11-10T14:15:00Z" });
    await updateBingoCard(pool, a.weekId, a.userId, "2026-11-10");
    expect(await state(a.weekId, a.userId, a.byCode.get("workout_before_8")!)).toBe("incomplete");
    await log(a.userId, "2026-11-11", { workoutStart: "2026-11-11T13:30:00Z" });
    await updateBingoCard(pool, a.weekId, a.userId, "2026-11-11");
    expect(await state(a.weekId, a.userId, a.byCode.get("workout_before_8")!)).toBe("complete");
  });

  it("Chicago: two 10:45 PM bedtimes complete 'in bed before 11pm x2'", async () => {
    const { weekId, userId, byCode } = await seed("America/Chicago", "2026-06-01", "2026-06-07");
    // wake-up log dates Tue + Wed; bedtimes 10:45 PM CDT the evenings before
    await log(userId, "2026-06-02", { bedtime: "2026-06-02T03:45:00Z" });
    await log(userId, "2026-06-03", { bedtime: "2026-06-03T03:45:00Z" });
    await updateBingoCard(pool, weekId, userId, "2026-06-03");
    expect(await state(weekId, userId, byCode.get("bed_before_11_x2")!)).toBe("complete");
  });

  it("Chicago: 11:15 PM and 1:00 AM bedtimes do not count", async () => {
    const { weekId, userId, byCode } = await seed("America/Chicago", "2026-06-01", "2026-06-07");
    await log(userId, "2026-06-02", { bedtime: "2026-06-02T04:15:00Z" }); // 11:15 PM
    await log(userId, "2026-06-03", { bedtime: "2026-06-03T06:00:00Z" }); // 1:00 AM
    await log(userId, "2026-06-04", { bedtime: "2026-06-04T03:45:00Z" }); // 10:45 PM (only 1 good night)
    await updateBingoCard(pool, weekId, userId, "2026-06-04");
    expect(await state(weekId, userId, byCode.get("bed_before_11_x2")!)).toBe("incomplete");
  });

  it("a non-Chicago group is judged on its own clock (London, BST)", async () => {
    const { weekId, userId, byCode } = await seed("Europe/London", "2026-06-01", "2026-06-07");
    // 06:45 UTC = 7:45 AM BST → before 8; bedtimes 21:30 UTC = 10:30 PM BST
    await log(userId, "2026-06-02", { workoutStart: "2026-06-02T06:45:00Z", bedtime: "2026-06-01T21:30:00Z" });
    await log(userId, "2026-06-03", { bedtime: "2026-06-02T21:30:00Z" });
    await updateBingoCard(pool, weekId, userId, "2026-06-02");
    await updateBingoCard(pool, weekId, userId, "2026-06-03");
    expect(await state(weekId, userId, byCode.get("workout_before_8")!)).toBe("complete");
    expect(await state(weekId, userId, byCode.get("bed_before_11_x2")!)).toBe("complete");
  });
});
