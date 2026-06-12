import type { PoolClient } from "pg";

// Week boundaries are dates in the GROUP's timezone (plan §2 notes).

/** Date parts of `now` in the given IANA timezone. */
export function localDateParts(now: Date, timeZone: string): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

/** Monday (YYYY-MM-DD) of the week containing `now` in the group's timezone. */
export function weekMonday(now: Date, timeZone: string): string {
  const { y, m, d } = localDateParts(now, timeZone);
  // UTC arithmetic on the local calendar date — safe, no DST involvement
  const local = new Date(Date.UTC(y, m - 1, d));
  const dow = local.getUTCDay(); // 0 = Sunday
  local.setUTCDate(local.getUTCDate() - ((dow + 6) % 7));
  return local.toISOString().slice(0, 10);
}

/** Sunday (YYYY-MM-DD) for a given Monday. */
export function weekSunday(monday: string): string {
  const d = new Date(`${monday}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

/**
 * Create a group's first week: city = route_order 1, target = Σ member
 * targets. Runs inside the caller's transaction (group creation).
 */
export async function createFirstWeek(
  client: PoolClient,
  groupId: string,
  timezone: string,
  now = new Date(),
): Promise<void> {
  const monday = weekMonday(now, timezone);
  const city = await client.query("SELECT id FROM cities WHERE route_order = 1");
  if (!city.rowCount) throw new Error("cities table is not seeded");
  const target = await client.query(
    "SELECT COALESCE(SUM(weekly_step_target), 0)::int AS total FROM users WHERE group_id = $1",
    [groupId],
  );
  await client.query(
    `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (group_id, starts_on) DO NOTHING`,
    [groupId, city.rows[0].id, monday, weekSunday(monday), target.rows[0].total],
  );
}
