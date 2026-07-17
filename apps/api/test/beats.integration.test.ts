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
  const r = await pool.query(
    `INSERT INTO users (google_sub, email, display_name, group_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
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

    const events = await pool.query(
      `SELECT be.rendered, bd.slug, be.user_id
       FROM beat_events be JOIN beat_definitions bd ON bd.id = be.beat_id`,
    );
    expect(events.rowCount).toBe(1);
    expect(events.rows[0].slug).toBe("target_blowout");
    expect(events.rows[0].user_id).toBe(userA);

    const notifications = await pool.query(
      `SELECT kind, message FROM notifications WHERE user_id = $1`,
      [userA],
    );
    expect(notifications.rowCount).toBe(1);
    expect(notifications.rows[0].kind).toBe("beat");
    expect(notifications.rows[0].message).toBe(events.rows[0].rendered);
  });
});
