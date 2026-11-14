import type { Pool } from "pg";
import type { FitbitClient } from "./fitbitClient.js";
import { syncUserDay } from "./sync.js";
import { processScoutTokens } from "./scoutService.js";
import { createOrGetBingoCard, updateBingoCard } from "./bingoService.js";
import { closeElapsedDays } from "./nemesisService.js";
import { prepareNextWeekReveal, reconcileFinalizedWeek, weekRollover } from "./weekRollover.js";
import { evaluateDailyBeats } from "./beats.js";
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

  // Detection pipeline for each synced date: bingo → scout tokens → nemesis.
  // (M10 Field Ops: landmark unlocks flow from bingo lines, not the old
  // all-members-worked-out rule.)
  const week = await pool.query(
    `SELECT id, to_char(starts_on, 'YYYY-MM-DD') AS starts_on,
            to_char(ends_on, 'YYYY-MM-DD') AS ends_on
     FROM weeks WHERE group_id = $1 AND status = 'active'
     ORDER BY starts_on DESC LIMIT 1`,
    [group.id],
  );
  const weekId: string | null = week.rowCount ? week.rows[0].id : null;
  // Only days that belong to the active week may touch its card, scout
  // tokens, or beats. Monday noon re-pulls Sunday for late device syncs, but
  // by then the active week is the NEW one — Sunday's steps must not complete
  // tiles on the new card (the closed week is reconciled separately below).
  const weekDates = weekId
    ? dates.filter((d) => d >= week.rows[0].starts_on && d <= week.rows[0].ends_on)
    : [];

  for (const date of weekDates) {
    if (weekId) {
      for (const userId of memberIds) {
        try {
          await createOrGetBingoCard(pool, weekId, userId);
          await updateBingoCard(pool, weekId, userId, date);
          await processScoutTokens(pool, weekId, group.id, userId, date);
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

    for (const date of weekDates) {
      try {
        await evaluateDailyBeats(pool, weekId, group.id, date);
      } catch (err) {
        console.error(`cron: beat evaluation failed for group ${group.id}:`, err);
      }
    }
  }

  // Sunday sync ticks: prepare next week's nemesis pairings so the matchup is
  // visible before Monday, while all scoring stays on the current week.
  if (weekday === 7) {
    const ending = await pool.query(
      `SELECT id FROM weeks
       WHERE group_id = $1 AND status = 'active' AND ends_on = $2::date
       ORDER BY starts_on DESC LIMIT 1`,
      [group.id, today],
    );
    if (ending.rowCount) {
      try {
        await prepareNextWeekReveal(pool, ending.rows[0].id);
        console.log(`cron: Sunday nemesis reveal prepared for group ${group.id}`);
      } catch (err) {
        console.error(`cron: Sunday nemesis reveal failed for group ${group.id}:`, err);
      }
    }
  }

  // Monday noon group-local: the noon tick re-pulled Sunday for late device
  // syncs — reconcile the finalized week if late data materially changed the
  // case result (spec §14.6). Never re-awards badges or predictions.
  if (hour === 12 && weekday === 1) {
    const finalized = await pool.query(
      `SELECT id FROM weeks
       WHERE group_id = $1 AND status = 'closed' AND finalized_at IS NOT NULL
         AND ends_on = ($2::date - INTERVAL '1 day')::date
       ORDER BY starts_on DESC LIMIT 1`,
      [group.id, today],
    );
    if (finalized.rowCount) {
      try {
        await reconcileFinalizedWeek(pool, finalized.rows[0].id);
      } catch (err) {
        console.error(`cron: week reconciliation failed for group ${group.id}:`, err);
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

/**
 * Missed-rollover recovery. The week rollover normally runs on the Monday
 * 00:00 group-local tick; if that tick never fired (deploy, restart, crash)
 * or its rollover threw, the group would otherwise sit on an ended week
 * forever. This runs on every hourly tick and once at boot: if the group's
 * active week has already ended, pull the week's final day for every member,
 * close that day out on the old card, then roll over.
 *
 * Safe to repeat: syncUserDay upserts, bingo tiles never revert, and
 * weekRollover is transactional + idempotent (and row-locks the week).
 * Daily beats for the missed day are deliberately NOT replayed — they are
 * "today" flavor and would land a day or more late.
 * Returns true when a rollover was performed.
 */
export async function catchUpRollover(
  pool: Pool,
  client: FitbitClient,
  group: GroupRow,
  now: Date,
): Promise<boolean> {
  const { date: today } = localClock(now, group.timezone);
  const ended = await pool.query(
    `SELECT id, to_char(ends_on, 'YYYY-MM-DD') AS ends_on FROM weeks
     WHERE group_id = $1 AND status = 'active' AND ends_on < $2::date
     ORDER BY starts_on DESC LIMIT 1`,
    [group.id, today],
  );
  if (!ended.rowCount) return false;
  const weekId: string = ended.rows[0].id;
  const lastDay: string = ended.rows[0].ends_on;

  const members = await pool.query(`SELECT id FROM users WHERE group_id = $1`, [group.id]);
  for (const { id: userId } of members.rows as { id: string }[]) {
    try {
      await syncUserDay(pool, client, userId, lastDay);
    } catch (err) {
      await handleUserSyncError(pool, userId, err);
      continue; // close out with whatever was already synced for this user
    }
  }
  for (const { id: userId } of members.rows as { id: string }[]) {
    try {
      await createOrGetBingoCard(pool, weekId, userId);
      await updateBingoCard(pool, weekId, userId, lastDay);
      await processScoutTokens(pool, weekId, group.id, userId, lastDay);
    } catch (err) {
      console.error(`cron: catch-up bingo update failed for user ${userId}:`, err);
    }
  }

  await weekRollover(pool, weekId);
  console.warn(`cron: missed week rollover recovered for group ${group.id}`);
  return true;
}

/** Run the missed-rollover check for every group (boot + every tick). */
export async function runRolloverCatchUp(
  pool: Pool,
  client: FitbitClient,
  now = new Date(),
): Promise<void> {
  const groups = await pool.query<GroupRow>(`SELECT id, timezone FROM groups`);
  for (const group of groups.rows) {
    const { hour, weekday } = localClock(now, group.timezone);
    // The on-time Monday 00:00 tick rolls over at the END of runGroupSync
    // (after its own Sunday sync + day-close); don't pre-empt it.
    if (hour === 0 && weekday === 1) continue;
    try {
      await catchUpRollover(pool, client, group, now);
    } catch (err) {
      console.error(
        `cron: rollover catch-up failed for group ${group.id}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

/**
 * One hourly tick: recover any missed week rollover first (so the regular
 * sync below runs against the correct active week), then sync every group
 * whose local hour is a sync hour.
 */
export async function runCronTick(pool: Pool, client: FitbitClient, now = new Date()): Promise<void> {
  await runRolloverCatchUp(pool, client, now);
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

  // Runs are serialized: the boot catch-up and a tick (or two slow ticks)
  // never overlap inside this process.
  let queue: Promise<void> = Promise.resolve();
  const enqueue = (label: string, job: () => Promise<void>): void => {
    queue = queue.then(job).catch((err) => {
      console.error(`cron: ${label} failed:`, err instanceof Error ? err.message : err);
    });
  };
  const tick = () => enqueue("tick", () => runCronTick(pool, client));

  // Boot: a deploy/restart that swallowed the Monday 00:00 tick is repaired
  // now rather than at the next top of the hour.
  enqueue("boot rollover catch-up", () => runRolloverCatchUp(pool, client));

  const timeout = setTimeout(() => {
    tick();
    interval = setInterval(tick, 3600_000);
  }, msToNextHour);
  timeout.unref?.();

  console.log(`cron: scheduler armed (first tick in ${Math.round(msToNextHour / 1000)}s)`);
  return () => {
    clearTimeout(timeout);
    if (interval) clearInterval(interval);
  };
}
