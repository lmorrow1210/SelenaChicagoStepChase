import { resetDatabase } from "./helpers/db.js";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import type { pool as appPool } from "../src/db/pool.js";
import type { runGroupSync as runGroupSyncFn } from "../src/services/cron.js";
import { MockFitbitClient } from "../src/services/fitbitClient.js";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

type Pool = typeof appPool;

let pool: Pool;
let runGroupSync: typeof runGroupSyncFn;

async function createUser(label: string, groupId: string): Promise<string> {
  // Trackers connected: Selena performance beats require verified data
  // (M14 confidence gating), which a disconnected tracker suppresses.
  const r = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id, fitbit_connected)
     VALUES ($1, $2, $3, $4, TRUE) RETURNING id`,
    [`test-${label}`, `${label}@example.test`, `Player ${label}`, groupId],
  );
  return r.rows[0].id as string;
}

async function seed(): Promise<{ groupId: string; weekId: string; userA: string; userB: string }> {
  const g = await pool.query(
    `INSERT INTO groups (name, invite_code, timezone)
     VALUES ('Beat Test', 'BEAT01', 'America/Chicago') RETURNING id`,
  );
  const groupId = g.rows[0].id as string;
  const userA = await createUser("beat-a", groupId);
  const userB = await createUser("beat-b", groupId);
  const city = await pool.query(`SELECT id FROM cities WHERE route_order = 1`);
  const w = await pool.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, '2026-06-08', '2026-06-14', 140000) RETURNING id`,
    [groupId, city.rows[0].id],
  );
  return { groupId, weekId: w.rows[0].id as string, userA, userB };
}

describeDb("N1 narrative beats integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.JWT_SECRET = "test-secret";
    process.env.TOKEN_ENC_KEY = "a".repeat(64);

    await resetDatabase(TEST_DATABASE_URL!);

    ({ pool } = await import("../src/db/pool.js"));
    ({ runGroupSync } = await import("../src/services/cron.js"));
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE groups, users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("fires a daily beat once when cron re-runs the same date", async () => {
    const { groupId, userA, userB } = await seed();
    const client = new MockFitbitClient();
    const date = "2026-06-08";
    client.set(userA, date, {
      steps: 16000,
      workouts: [],
      sleep_minutes: 420,
      bedtime: null,
      active_zone_minutes: 20,
      hr_zones: null,
      steps_by_hour: null,
    });
    client.set(userB, date, {
      steps: 2000,
      workouts: [],
      sleep_minutes: 420,
      bedtime: null,
      active_zone_minutes: 5,
      hr_zones: null,
      steps_by_hour: null,
    });

    const mondayEveningChicago = new Date("2026-06-08T23:00:00Z");
    await runGroupSync(pool, client, { id: groupId, timezone: "America/Chicago" }, mondayEveningChicago);
    await runGroupSync(pool, client, { id: groupId, timezone: "America/Chicago" }, mondayEveningChicago);

    // Re-running the same date never fires any beat twice.
    const duplicates = await pool.query(
      `SELECT beat_id, user_id, fired_on, COUNT(*)::int AS n
       FROM beat_events GROUP BY beat_id, user_id, fired_on HAVING COUNT(*) > 1`,
    );
    expect(duplicates.rowCount).toBe(0);

    const events = await pool.query(
      `SELECT be.rendered, bd.slug, be.user_id
       FROM beat_events be JOIN beat_definitions bd ON bd.id = be.beat_id
       WHERE bd.slug = 'target_blowout'`,
    );
    expect(events.rowCount).toBe(1);
    expect(events.rows[0].user_id).toBe(userA);

    // With connected trackers the trust beat has nothing to say.
    const trust = await pool.query(
      `SELECT 1 FROM beat_events be JOIN beat_definitions bd ON bd.id = be.beat_id
       WHERE bd.slug = 'group_data_incomplete'`,
    );
    expect(trust.rowCount).toBe(0);

    const notifications = await pool.query(
      `SELECT kind, message FROM notifications WHERE user_id = $1 AND message = $2`,
      [userA, events.rows[0].rendered],
    );
    expect(notifications.rowCount).toBe(1);
    expect(notifications.rows[0].kind).toBe("beat");
  });

  it("suppresses Selena performance beats and fires the trust beat when trackers are disconnected", async () => {
    const { groupId, userA, userB } = await seed();
    await pool.query(`UPDATE users SET fitbit_connected = FALSE WHERE id IN ($1, $2)`, [userA, userB]);
    await pool.query(
      `INSERT INTO step_logs (user_id, log_date, steps) VALUES ($1, '2026-06-08', 16000)`,
      [userA],
    );
    const { evaluateDailyBeats } = await import("../src/services/beats.js");
    const week = await pool.query(`SELECT id FROM weeks WHERE group_id = $1`, [groupId]);
    await evaluateDailyBeats(pool, week.rows[0].id, groupId, "2026-06-08");

    const slugs = await pool.query(
      `SELECT bd.slug FROM beat_events be JOIN beat_definitions bd ON bd.id = be.beat_id`,
    );
    const fired = slugs.rows.map((row) => row.slug as string);
    expect(fired).toContain("group_data_incomplete");
    expect(fired).not.toContain("target_blowout");
  });
});
