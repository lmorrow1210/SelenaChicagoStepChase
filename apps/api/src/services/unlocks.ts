import type { Pool, PoolClient } from "pg";

function dayNumber(startsOn: string, date: string): number {
  const start = new Date(`${startsOn}T00:00:00Z`);
  const current = new Date(`${date}T00:00:00Z`);
  return Math.floor((current.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

export async function detectUnlocks(
  db: Pool | PoolClient,
  groupId: string,
  date: string,
  triggeringUserId: string | null = null,
): Promise<{ unlocked: boolean; landmarkId: number | null }> {
  const week = await db.query(
    `SELECT id, city_id, starts_on
     FROM weeks
     WHERE group_id = $1
       AND $2::date BETWEEN starts_on AND ends_on
     ORDER BY starts_on DESC
     LIMIT 1`,
    [groupId, date],
  );
  if (!week.rowCount) return { unlocked: false, landmarkId: null };

  const day = dayNumber(week.rows[0].starts_on, date);
  if (day < 1 || day > 7) return { unlocked: false, landmarkId: null };

  const landmark = await db.query(
    "SELECT id FROM landmarks WHERE city_id = $1 AND day = $2",
    [week.rows[0].city_id, day],
  );
  if (!landmark.rowCount) return { unlocked: false, landmarkId: null };

  const workoutStatus = await db.query(
    `SELECT COUNT(u.id)::int AS total_members,
            COUNT(u.id) FILTER (
              WHERE COALESCE(jsonb_array_length(sl.workouts), 0) > 0
            )::int AS worked_out
     FROM users u
     LEFT JOIN step_logs sl ON sl.user_id = u.id AND sl.log_date = $2
     WHERE u.group_id = $1`,
    [groupId, date],
  );

  const totalMembers = Number(workoutStatus.rows[0].total_members);
  const workedOut = Number(workoutStatus.rows[0].worked_out);
  if (totalMembers === 0 || workedOut < totalMembers) {
    return { unlocked: false, landmarkId: landmark.rows[0].id };
  }

  const unlock = await db.query(
    `INSERT INTO city_unlocks (
       week_id, landmark_id, unlock_date, unlocked, unlocked_at, triggering_user
     )
     VALUES ($1, $2, $3, TRUE, now(), $4)
     ON CONFLICT (week_id, landmark_id) DO UPDATE SET
       unlocked = TRUE,
       unlocked_at = COALESCE(city_unlocks.unlocked_at, EXCLUDED.unlocked_at),
       triggering_user = COALESCE(city_unlocks.triggering_user, EXCLUDED.triggering_user)
     RETURNING landmark_id`,
    [week.rows[0].id, landmark.rows[0].id, date, triggeringUserId],
  );

  return { unlocked: Boolean(unlock.rowCount), landmarkId: unlock.rows[0]?.landmark_id ?? null };
}
