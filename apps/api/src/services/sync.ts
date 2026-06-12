import type { Pool, PoolClient } from "pg";
import type { FitbitClient } from "./fitbitClient.js";
import { localDateParts } from "./week.js";

// Upsert one user's day. Idempotent on (user_id, log_date) — plan §5.
// PII rule: never log step values or tokens.

export async function syncUserDay(
  db: Pool | PoolClient,
  client: FitbitClient,
  userId: string,
  date: string,
): Promise<void> {
  const m = await client.fetchDay(userId, date);
  await db.query(
    `INSERT INTO step_logs
       (user_id, log_date, steps, workouts, sleep_minutes, bedtime,
        active_zone_minutes, hr_zones, synced_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     ON CONFLICT (user_id, log_date) DO UPDATE SET
       steps = EXCLUDED.steps,
       workouts = EXCLUDED.workouts,
       sleep_minutes = EXCLUDED.sleep_minutes,
       bedtime = EXCLUDED.bedtime,
       active_zone_minutes = EXCLUDED.active_zone_minutes,
       hr_zones = EXCLUDED.hr_zones,
       synced_at = now()`,
    [
      userId,
      date,
      m.steps,
      JSON.stringify(m.workouts),
      m.sleep_minutes,
      m.bedtime,
      m.active_zone_minutes,
      m.hr_zones ? JSON.stringify(m.hr_zones) : null,
    ],
  );

  // nemesis tiebreak: first sync where the daily target was reached
  await db.query(
    `UPDATE step_logs sl SET target_hit_at = now()
     FROM users u
     WHERE sl.user_id = $1 AND sl.log_date = $2 AND sl.target_hit_at IS NULL
       AND u.id = sl.user_id
       AND sl.steps >= u.weekly_step_target / 7`,
    [userId, date],
  );

  await db.query("UPDATE users SET last_synced_at = now() WHERE id = $1", [userId]);
}

/** Sync today (group tz) for one user. The cron job (M8) reuses this. */
export async function syncUserToday(
  db: Pool,
  client: FitbitClient,
  userId: string,
  timezone: string,
  now = new Date(),
): Promise<void> {
  const { y, m, d } = localDateParts(now, timezone);
  const date = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  await syncUserDay(db, client, userId, date);
}
