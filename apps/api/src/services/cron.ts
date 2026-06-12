import type { Pool } from "pg";
import type { FitbitClient } from "./fitbitClient.js";
import { syncUserDay } from "./sync.js";
import { detectUnlocks } from "./unlocks.js";
import { createOrGetBingoCard, updateBingoCard } from "./bingoService.js";
import { closeElapsedDays } from "./nemesisService.js";
import { weekRollover } from "./weekRollover.js";
import { InvalidGrantError, NotConnectedError } from "./realFitbitClient.js";

// Sync schedule (plan §5): noon / 6pm / midnight group-local. Cron ticks
// hourly; the midnight run doubles as day-close (sync → unlocks → bingo →
// nemesis) and Monday midnight triggers the week rollover.
// PII rule: log user/group ids only — never steps, tokens, or email.

export const SYNC_HOURS = [0, 12, 18] as const;

/** Hour-of-day (0–23) and weekday (1=Mon…7=Sun) of `now` in an IANA tz. */
export function localClock(now: Date, timeZone: string): { hour: number; date: string; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
  return { hour: Number(get("hour")), date, weekday: dow === 0 ? 7 : dow };
}

export function isSyncHour(hour: number): boolean {
  return (SYNC_HOURS as readonly number[]).includes(hour);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function handleUserSyncError(pool: Pool, userId: string, err: unknown): Promise<void> {
  if (err instanceof NotConnectedError) return; // nothing to sync; not an error
  if (err instanceof InvalidGrantError) {
    await pool.query(`UPDATE users SET fitbit_connected = FALSE WHERE id = $1`, [userId]);
    await pool.query(
      `INSERT INTO notifications (user_id, kind, message)
       VALUES ($1, 'alert', 'Your Fitbit connection expired — reconnect to keep syncing.')`,
      [userId],
    );
    console.warn(`cron: invalid_grant for user ${userId}; marked disconnected`);
    return;
  }
  console.error(`cron: sync failed for user ${userId}:`, err instanceof Error ? err.message : err);
}

interface GroupRow {
  id: string;
  timezone: string;
}

/**
 * Run one group's scheduled sync. Per-user failures never abort the batch
 * (plan §5). Detections run after all members synced so "everyone worked
 * out" checks see complete data.
 */
export async function runGroupSync(
  pool: Pool,
  client: FitbitClient,
  group: GroupRow,
  now: Date,
): Promise<void> {
  const { hour, date: today, weekday } = localClock(now, group.timezone);

  const members = await pool.query(`SELECT id FROM users WHERE group_id = $1`, [group.id]);
  const memberIds: string[] = members.rows.map((r) => r.id);
  if (!memberIds.length) return;

  // Midnight closes out yesterday; noon re-pulls yesterday for late device
  // syncs (plan §5); 6pm only pulls today.
  const dates: string[] = [];
  if (hour === 0) dates.push(addDays(today, -1));
  else {
    if (hour === 12) dates.push(addDays(today, -1));
    dates.push(today);
  }

  for (const userId of memberIds) {
    for (const date of dates) {
      try {
        await syncUserDay(pool, client, userId, date);
      } catch (err) {
        await handleUserSyncError(pool, userId, err);
        break; // skip this user's remaining dates; next user continues
      }
    }
  }

  // Detection pipeline for each synced date: unlocks → bingo → nemesis.
  const week = await pool.query(
    `SELECT id FROM weeks WHERE group_id = $1 AND status = 'active'
     ORDER BY starts_on DESC LIMIT 1`,
    [group.id],
  );
  const weekId: string | null = week.rowCount ? week.rows[0].id : null;

  for (const date of dates) {
    try {
      await detectUnlocks(pool, group.id, date, null);
    } catch (err) {
      console.error(`cron: unlock detection failed for group ${group.id}:`, err);
    }
    if (weekId) {
      for (const userId of memberIds) {
        try {
          await createOrGetBingoCard(pool, weekId, userId);
          await updateBingoCard(pool, weekId, userId, date);
        } catch (err) {
          console.error(`cron: bingo update failed for user ${userId}:`, err);
        }
      }
    }
  }

  if (weekId) {
    const matchups = await pool.query(`SELECT id FROM nemesis_matchups WHERE week_id = $1`, [
      weekId,
    ]);
    for (const m of matchups.rows) {
      try {
        await closeElapsedDays(pool, m.id, today);
      } catch (err) {
        console.error(`cron: nemesis day-close failed for matchup ${m.id}:`, err);
      }
    }
  }

  // Monday 00:00 group-local: roll the ended week over.
  if (hour === 0 && weekday === 1) {
    const ended = await pool.query(
      `SELECT id FROM weeks
       WHERE group_id = $1 AND status = 'active' AND ends_on < $2::date
       ORDER BY starts_on DESC LIMIT 1`,
      [group.id, today],
    );
    if (ended.rowCount) {
      try {
        await weekRollover(pool, ended.rows[0].id);
        console.log(`cron: week rollover complete for group ${group.id}`);
      } catch (err) {
        console.error(`cron: week rollover failed for group ${group.id}:`, err);
      }
    }
  }
}

/** One hourly tick: sync every group whose local hour is a sync hour. */
export async function runCronTick(pool: Pool, client: FitbitClient, now = new Date()): Promise<void> {
  const groups = await pool.query<GroupRow>(`SELECT id, timezone FROM groups`);
  for (const group of groups.rows) {
    const { hour } = localClock(now, group.timezone);
    if (!isSyncHour(hour)) continue;
    try {
      await runGroupSync(pool, client, group, now);
    } catch (err) {
      console.error(`cron: group sync failed for ${group.id}:`, err);
    }
  }
}

/**
 * Start the hourly scheduler aligned to the top of the hour.
 * Returns a stop function (used by tests / graceful shutdown).
 */
export function startCron(pool: Pool, client: FitbitClient): () => void {
  let interval: NodeJS.Timeout | null = null;
  const msToNextHour = 3600_000 - (Date.now() % 3600_000);

  const timeout = setTimeout(() => {
    void runCronTick(pool, client);
    interval = setInterval(() => void runCronTick(pool, client), 3600_000);
  }, msToNextHour);
  timeout.unref?.();

  console.log(`cron: scheduler armed (first tick in ${Math.round(msToNextHour / 1000)}s)`);
  return () => {
    clearTimeout(timeout);
    if (interval) clearInterval(interval);
  };
}
