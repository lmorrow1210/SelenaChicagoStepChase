import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import type { pool as appPool } from "../src/db/pool.js";
import type {
  catchUpRollover as catchUpFn,
  runCronTick as tickFn,
  runGroupSync as groupSyncFn,
  runRolloverCatchUp as runCatchUpFn,
} from "../src/services/cron.js";
import type { createOrGetBingoCard as createCardFn } from "../src/services/bingoService.js";
import { MockFitbitClient, type DayMetrics } from "../src/services/fitbitClient.js";
import type { BingoTile } from "@one-step-ahead/shared";

// Missed-rollover recovery: the Monday 00:00 tick is the only on-time
// trigger for weekRollover. These tests pin that a group never stays stuck
// on an ended week, that recovery is idempotent, and that a prior week's
// day can never complete tiles on the next week's card.

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type Pool = typeof appPool;
let pool: Pool;
let catchUpRollover: typeof catchUpFn;
let runCronTick: typeof tickFn;
let runGroupSync: typeof groupSyncFn;
let runRolloverCatchUp: typeof runCatchUpFn;
let createOrGetBingoCard: typeof createCardFn;

const TZ = "America/Chicago";
// Week Mon 2026-06-01 … Sun 2026-06-07 (CDT, UTC-5)
const WEEK_START = "2026-06-01";
const WEEK_END = "2026-06-07";
const MON_0000 = new Date("2026-06-08T05:00:00Z"); // Mon 00:00 Chicago (on time)
const MON_0300 = new Date("2026-06-08T08:00:00Z"); // Mon 03:00 Chicago (non-sync hour)
const MON_1200 = new Date("2026-06-08T17:00:00Z"); // Mon noon Chicago
const SUN_2300 = new Date("2026-06-08T04:00:00Z"); // Sun 23:00 Chicago (week not over)
const WED_0900 = new Date("2026-06-10T14:00:00Z"); // two days late

function day(steps: number): DayMetrics {
  return {
    steps,
    workouts: [],
    sleep_minutes: 400,
    bedtime: null,
    active_zone_minutes: 0,
    hr_zones: null,
    steps_by_hour: null,
  };
}

async function seed() {
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code, timezone) VALUES ('Catch-up Test', 'CATCHU', $1) RETURNING id`,
    [TZ],
  );
  const groupId = g.rows[0].id as string;
  const mk = async (label: string) =>
    (
      await pool.query(
        `INSERT INTO users (google_sub, email, display_name, group_id, fitbit_connected)
         VALUES ($1, $2, $3, $4, TRUE) RETURNING id`,
        [`test-${label}`, `${label}@example.test`, `Player ${label}`, groupId],
      )
    ).rows[0].id as string;
  const userA = await mk("cu-a");
  const userB = await mk("cu-b");
  const city = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const w = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, $3, $4, 140000) RETURNING id`,
    [groupId, city.rows[0].id, WEEK_START, WEEK_END],
  );
  return { groupId, weekId: w.rows[0].id as string, userA, userB };
}

async function weeks(groupId: string) {
  const r = await pool.query(
    `SELECT w.id, w.status, to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on, c.route_order
     FROM weeks w JOIN cities c ON c.id = w.city_id
     WHERE w.group_id = $1 ORDER BY w.starts_on`,
    [groupId],
  );
  return r.rows as { id: string; status: string; starts_on: string; route_order: number }[];
}

async function counts(groupId: string) {
  const r = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM weeks WHERE group_id = $1) AS weeks,
       (SELECT COUNT(*)::int FROM badges ub JOIN users u ON u.id = ub.user_id WHERE u.group_id = $1) AS badges,
       (SELECT COUNT(*)::int FROM notifications n JOIN users u ON u.id = n.user_id WHERE u.group_id = $1) AS notifications,
       (SELECT COUNT(*)::int FROM bingo_cards bc JOIN users u ON u.id = bc.user_id WHERE u.group_id = $1) AS cards,
       (SELECT COUNT(*)::int FROM nemesis_matchups nm JOIN weeks w ON w.id = nm.week_id WHERE w.group_id = $1) AS matchups`,
    [groupId],
  );
  return r.rows[0];
}

describeDb("missed week rollover catch-up", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);
    await resetDatabase(TEST_DATABASE_URL!);
    ({ pool } = await import("../src/db/pool.js"));
    ({ catchUpRollover, runCronTick, runGroupSync, runRolloverCatchUp } = await import(
      "../src/services/cron.js"
    ));
    ({ createOrGetBingoCard } = await import("../src/services/bingoService.js"));
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("does nothing while the active week is still running", async () => {
    const { groupId } = await seed();
    const client = new MockFitbitClient();
    expect(await catchUpRollover(pool, client, { id: groupId, timezone: TZ }, SUN_2300)).toBe(false);
    const w = await weeks(groupId);
    expect(w).toHaveLength(1);
    expect(w[0].status).toBe("active");
  });

  it("a non-sync-hour tick after a missed Monday 00:00 rolls the week over", async () => {
    const { groupId, weekId, userA, userB } = await seed();
    const client = new MockFitbitClient();
    client.set(userA, WEEK_END, day(9000));
    client.set(userB, WEEK_END, day(4000));

    await runCronTick(pool, client, MON_0300);

    const w = await weeks(groupId);
    expect(w.map((x) => x.status)).toEqual(["closed", "active"]);
    expect(w[1].starts_on).toBe("2026-06-08");
    expect(w[1].route_order).toBe(2);
    // the ended week's final day was pulled before close-out, so its steps count
    const closed = await pool.query(`SELECT group_total_steps FROM weeks WHERE id = $1`, [weekId]);
    expect(Number(closed.rows[0].group_total_steps)).toBe(13000);
    // new-week cards exist for both members; old cards are frozen
    const cards = await pool.query(
      `SELECT week_id, frozen FROM bingo_cards WHERE user_id = ANY($1) ORDER BY week_id`,
      [[userA, userB]],
    );
    expect(cards.rows.filter((c) => c.week_id === weekId).every((c) => c.frozen)).toBe(true);
    expect(cards.rows.filter((c) => c.week_id === w[1].id)).toHaveLength(2);
  });

  it("recovers even days late, and is idempotent across repeated ticks", async () => {
    const { groupId } = await seed();
    const client = new MockFitbitClient();

    await runRolloverCatchUp(pool, client, WED_0900);
    const first = await counts(groupId);
    expect(first.weeks).toBe(2);

    await runRolloverCatchUp(pool, client, WED_0900);
    await runCronTick(pool, client, new Date(WED_0900.getTime() + 3600_000));
    expect(await counts(groupId)).toEqual(first);
    expect((await weeks(groupId)).map((x) => x.status)).toEqual(["closed", "active"]);
  });

  it("concurrent catch-ups (boot + tick) produce exactly one rollover", async () => {
    const { groupId } = await seed();
    const client = new MockFitbitClient();
    const group = { id: groupId, timezone: TZ };

    const results = await Promise.allSettled([
      catchUpRollover(pool, client, group, MON_0300),
      catchUpRollover(pool, client, group, MON_0300),
    ]);
    expect(results.some((r) => r.status === "fulfilled")).toBe(true);

    const w = await weeks(groupId);
    expect(w.map((x) => x.status)).toEqual(["closed", "active"]);
    const c = await counts(groupId);
    expect(c.weeks).toBe(2);
    expect(c.matchups).toBe(1);
    // exactly one week-closure summary per member
    const summaries = await pool.query(
      `SELECT COUNT(*)::int AS n FROM notifications n JOIN users u ON u.id = n.user_id
       WHERE u.group_id = $1 AND n.message LIKE 'Week closed:%'`,
      [groupId],
    );
    expect(Number(summaries.rows[0].n)).toBe(2);
  });

  it("the on-time Monday 00:00 tick still rolls over exactly once", async () => {
    const { groupId } = await seed();
    const client = new MockFitbitClient();
    await runCronTick(pool, client, MON_0000);
    await runCronTick(pool, client, MON_0300);
    const c = await counts(groupId);
    expect(c.weeks).toBe(2);
    expect((await weeks(groupId)).map((x) => x.status)).toEqual(["closed", "active"]);
  });

  it("a member whose sync fails does not block the catch-up", async () => {
    const { groupId, userA } = await seed();
    const failing = new MockFitbitClient();
    const orig = failing.fetchDay.bind(failing);
    failing.fetchDay = async (userId, date) => {
      if (userId === userA) throw new Error("upstream 500");
      return orig(userId, date);
    };
    await runRolloverCatchUp(pool, failing, MON_0300);
    expect((await weeks(groupId)).map((x) => x.status)).toEqual(["closed", "active"]);
  });

  it("Monday noon's re-pull of Sunday cannot complete tiles on the NEW week's card", async () => {
    const { groupId, userA, userB } = await seed();
    const client = new MockFitbitClient();
    // Sunday (old week): 16k steps. Monday (new week): 500 steps.
    for (const u of [userA, userB]) {
      client.set(u, WEEK_END, day(16000));
      client.set(u, "2026-06-08", day(500));
    }
    await runCronTick(pool, client, MON_0000);
    const w = await weeks(groupId);
    const newWeekId = w[1].id;

    // plant "10,000 steps in a day" on the new week's card
    const def = await pool.query(
      `SELECT id FROM bingo_challenge_definitions WHERE code = 'steps_10k_day'`,
    );
    const tenK = Number(def.rows[0].id);
    const fillers = await pool.query(
      `SELECT id FROM bingo_challenge_definitions WHERE code <> 'steps_10k_day' ORDER BY id LIMIT 23`,
    );
    const tiles: BingoTile[] = [tenK, ...fillers.rows.map((r) => Number(r.id))].map((id) => ({
      challenge_id: id,
      state: "incomplete" as const,
    }));
    tiles.splice(12, 0, { free: true, state: "complete" });
    await createOrGetBingoCard(pool, newWeekId, userA);
    await pool.query(`UPDATE bingo_cards SET tiles = $1 WHERE week_id = $2 AND user_id = $3`, [
      JSON.stringify(tiles),
      newWeekId,
      userA,
    ]);

    await runGroupSync(pool, client, { id: groupId, timezone: TZ }, MON_1200);

    const card = await pool.query(
      `SELECT tiles FROM bingo_cards WHERE week_id = $1 AND user_id = $2`,
      [newWeekId, userA],
    );
    const tile = (card.rows[0].tiles as BingoTile[]).find(
      (t) => "challenge_id" in t && t.challenge_id === tenK,
    );
    expect(tile?.state).toBe("incomplete");
  });
});
