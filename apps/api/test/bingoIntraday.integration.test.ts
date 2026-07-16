import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import type { pool as appPool } from "../src/db/pool.js";
import type {
  createOrGetBingoCard as createCardFn,
  updateBingoCard as updateCardFn,
} from "../src/services/bingoService.js";
import type { syncUserDay as syncFn } from "../src/services/sync.js";
import { MockFitbitClient } from "../src/services/fitbitClient.js";
import type { BingoTile } from "@one-step-ahead/shared";

// M11: intraday + multi-night bingo auto-detectors, end to end through the
// real SQL context building (steps_by_hour persistence, workout_day_streak,
// week sleep nights).

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type Pool = typeof appPool;

let pool: Pool;
let createOrGetBingoCard: typeof createCardFn;
let updateBingoCard: typeof updateCardFn;
let syncUserDay: typeof syncFn;

const TARGET_CODES = [
  "steps_5k_noon", // steps_before hour 12 ≥ 5000
  "steps_evening_4k", // steps_after hour 18 ≥ 4000
  "workouts_2_row", // workout_day_streak ≥ 2
  "workouts_3_row", // workout_day_streak ≥ 3 (must stay incomplete)
  "sleep_7h_x3", // sleep_nights ≥ 3 nights of 7h+
  "sleep_8h_weekend", // weekend-gated sleep (must stay incomplete on a Thursday)
] as const;

async function seed(): Promise<{ groupId: string; weekId: string; userId: string }> {
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code) VALUES ('Intraday Test', 'INTRDY') RETURNING id`,
  );
  const groupId = g.rows[0].id as string;
  const u = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id)
     VALUES ('test-intraday', 'intraday@example.test', 'Player Intraday', $1) RETURNING id`,
    [groupId],
  );
  const city = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const w = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, '2026-06-01', '2026-06-07', 140000) RETURNING id`,
    [groupId, city.rows[0].id],
  );
  return { groupId, weekId: w.rows[0].id as string, userId: u.rows[0].id as string };
}

function hours(spec: Record<number, number>): number[] {
  const out = Array.from({ length: 24 }, () => 0);
  for (const [h, steps] of Object.entries(spec)) out[Number(h)] = steps;
  return out;
}

async function insertLog(
  userId: string,
  date: string,
  fields: {
    steps: number;
    workouts?: { type: string; start: string; duration_min: number; zone_min: number }[];
    sleep_minutes?: number | null;
    steps_by_hour?: number[] | null;
  },
): Promise<void> {
  await pool.query(
    `INSERT INTO step_logs (user_id, log_date, steps, workouts, sleep_minutes, steps_by_hour)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      userId,
      date,
      fields.steps,
      JSON.stringify(fields.workouts ?? []),
      fields.sleep_minutes ?? null,
      fields.steps_by_hour ? JSON.stringify(fields.steps_by_hour) : null,
    ],
  );
}

/** Overwrite a card so its first tiles are the target challenges (known
    positions), padded with arbitrary other challenges. */
async function plantCard(weekId: string, userId: string): Promise<Map<string, number>> {
  await createOrGetBingoCard(pool, weekId, userId);
  const targets = await pool.query(
    `SELECT id, code FROM bingo_challenge_definitions WHERE code = ANY($1)`,
    [TARGET_CODES as unknown as string[]],
  );
  expect(targets.rowCount).toBe(TARGET_CODES.length);
  const byCode = new Map<string, number>(targets.rows.map((r) => [r.code, Number(r.id)]));

  const fillers = await pool.query(
    `SELECT id FROM bingo_challenge_definitions WHERE NOT (code = ANY($1)) ORDER BY id LIMIT 18`,
    [TARGET_CODES as unknown as string[]],
  );
  const ids = [...byCode.values(), ...fillers.rows.map((r) => Number(r.id))];
  const tiles: BingoTile[] = ids.map((id) => ({ challenge_id: id, state: "incomplete" as const }));
  tiles.splice(12, 0, { free: true, state: "complete" });
  await pool.query(`UPDATE bingo_cards SET tiles = $1 WHERE week_id = $2 AND user_id = $3`, [
    JSON.stringify(tiles),
    weekId,
    userId,
  ]);
  return byCode;
}

async function tileStates(
  weekId: string,
  userId: string,
  byCode: Map<string, number>,
): Promise<Record<string, string>> {
  const r = await pool.query(`SELECT tiles FROM bingo_cards WHERE week_id = $1 AND user_id = $2`, [
    weekId,
    userId,
  ]);
  const tiles: BingoTile[] = r.rows[0].tiles;
  const states: Record<string, string> = {};
  for (const [code, id] of byCode) {
    const tile = tiles.find((t) => "challenge_id" in t && t.challenge_id === id);
    states[code] = tile?.state ?? "missing";
  }
  return states;
}

describeDb("M11 intraday bingo detectors integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL!);

    ({ pool } = await import("../src/db/pool.js"));
    ({ createOrGetBingoCard, updateBingoCard } = await import("../src/services/bingoService.js"));
    ({ syncUserDay } = await import("../src/services/sync.js"));
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("syncUserDay persists hourly buckets (and null when intraday is unavailable)", async () => {
    const { userId } = await seed();
    const client = new MockFitbitClient();

    await syncUserDay(pool, client, userId, "2026-06-02");
    const withIntraday = await pool.query(
      `SELECT steps, steps_by_hour FROM step_logs WHERE user_id = $1 AND log_date = '2026-06-02'`,
      [userId],
    );
    const buckets: number[] = withIntraday.rows[0].steps_by_hour;
    expect(buckets).toHaveLength(24);
    expect(buckets.reduce((a, b) => a + b, 0)).toBe(Number(withIntraday.rows[0].steps));

    // real-client shape: no intraday → column stays NULL
    client.set(userId, "2026-06-03", {
      steps: 7200,
      workouts: [],
      sleep_minutes: 400,
      bedtime: null,
      active_zone_minutes: 5,
      hr_zones: null,
      steps_by_hour: null,
    });
    await syncUserDay(pool, client, userId, "2026-06-03");
    const withoutIntraday = await pool.query(
      `SELECT steps_by_hour FROM step_logs WHERE user_id = $1 AND log_date = '2026-06-03'`,
      [userId],
    );
    expect(withoutIntraday.rows[0].steps_by_hour).toBeNull();
  });

  it("completes intraday + multi-night tiles from real step_log context", async () => {
    const { weekId, userId } = await seed();
    const byCode = await plantCard(weekId, userId);

    const workout = (date: string) => [
      { type: "walk", start: `${date}T17:30:00Z`, duration_min: 30, zone_min: 12 },
    ];
    // Mon: 7h+ night #1, no workout, synced without intraday buckets
    await insertLog(userId, "2026-06-01", { steps: 6000, sleep_minutes: 430, steps_by_hour: null });
    // Tue: short night, no workout
    await insertLog(userId, "2026-06-02", { steps: 5000, sleep_minutes: 300 });
    // Wed: workout day 1, 7h+ night #2
    await insertLog(userId, "2026-06-03", {
      steps: 7000,
      sleep_minutes: 425,
      workouts: workout("2026-06-03"),
    });
    // Thu (eval date): workout day 2 → streak 2; 8h+ night #3; 5,500 steps
    // before noon and 4,200 after 6pm
    await insertLog(userId, "2026-06-04", {
      steps: 9700,
      sleep_minutes: 500,
      workouts: workout("2026-06-04"),
      steps_by_hour: hours({ 7: 3000, 8: 2500, 19: 4200 }),
    });

    await updateBingoCard(pool, weekId, userId, "2026-06-04");
    const states = await tileStates(weekId, userId, byCode);

    expect(states.steps_5k_noon).toBe("complete");
    expect(states.steps_evening_4k).toBe("complete");
    expect(states.workouts_2_row).toBe("complete");
    expect(states.workouts_3_row).toBe("incomplete"); // streak is exactly 2
    expect(states.sleep_7h_x3).toBe("complete"); // 430 + 425 + 500
    expect(states.sleep_8h_weekend).toBe("incomplete"); // 500min but a Thursday
  });

  it("intraday tiles stay incomplete when the day has no hourly buckets", async () => {
    const { weekId, userId } = await seed();
    const byCode = await plantCard(weekId, userId);

    await insertLog(userId, "2026-06-04", {
      steps: 20000, // plenty of steps, but no intraday evidence
      sleep_minutes: 300,
      steps_by_hour: null,
    });

    await updateBingoCard(pool, weekId, userId, "2026-06-04");
    const states = await tileStates(weekId, userId, byCode);

    expect(states.steps_5k_noon).toBe("incomplete");
    expect(states.steps_evening_4k).toBe("incomplete");
  });
});
