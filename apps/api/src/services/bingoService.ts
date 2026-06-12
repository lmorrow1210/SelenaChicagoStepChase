import type { Pool, PoolClient } from "pg";
import {
  generateCard,
  countBingoLines,
  isBlackout,
  evaluateDetector,
  type DetectorContext,
} from "./bingo.js";
import type { BingoTile } from "@selenas-chase/shared";

/** Persist a new bingo card for a user+week if one doesn't already exist. */
export async function createOrGetBingoCard(
  db: Pool | PoolClient,
  weekId: string,
  userId: string,
): Promise<{ id: string; tiles: BingoTile[]; bingo_lines: number; blackout: boolean; frozen: boolean }> {
  const existing = await db.query(
    `SELECT id, tiles, bingo_lines, blackout, frozen
     FROM bingo_cards WHERE week_id = $1 AND user_id = $2`,
    [weekId, userId],
  );
  if (existing.rowCount) return existing.rows[0];

  const challenges = await db.query(
    "SELECT id, category FROM bingo_challenge_definitions ORDER BY id",
  );
  const tiles = generateCard(challenges.rows);

  const inserted = await db.query(
    `INSERT INTO bingo_cards (week_id, user_id, tiles, bingo_lines, blackout, frozen)
     VALUES ($1, $2, $3, 0, FALSE, FALSE)
     ON CONFLICT (week_id, user_id) DO UPDATE SET tiles = bingo_cards.tiles
     RETURNING id, tiles, bingo_lines, blackout, frozen`,
    [weekId, userId, JSON.stringify(tiles)],
  );
  return inserted.rows[0];
}

/**
 * Evaluate each tile in a user's bingo card against step_log data for
 * the given date (and week-scope metrics). Update tile states, bingo_lines,
 * and blackout. Frozen cards are skipped.
 */
export async function updateBingoCard(
  db: Pool | PoolClient,
  weekId: string,
  userId: string,
  date: string,
): Promise<void> {
  const cardRow = await db.query(
    `SELECT id, tiles, frozen FROM bingo_cards WHERE week_id = $1 AND user_id = $2`,
    [weekId, userId],
  );
  if (!cardRow.rowCount || cardRow.rows[0].frozen) return;

  const tiles: BingoTile[] = cardRow.rows[0].tiles;

  // Day-scoped step_log for context
  const logRow = await db.query(
    `SELECT steps, workouts, sleep_minutes, active_zone_minutes, hr_zones
     FROM step_logs WHERE user_id = $1 AND log_date = $2`,
    [userId, date],
  );

  // Week-scoped totals (for workouts_3_week and group_week_steps)
  const weekRows = await db.query(
    `SELECT w.starts_on, w.ends_on, w.group_id
     FROM weeks w WHERE w.id = $1`,
    [weekId],
  );
  const { starts_on, ends_on, group_id } = weekRows.rows[0];

  const weekWorkoutsRow = await db.query(
    `SELECT COALESCE(SUM(jsonb_array_length(workouts)), 0)::int AS total
     FROM step_logs WHERE user_id = $1
       AND log_date BETWEEN $2::date AND $3::date`,
    [userId, starts_on, ends_on],
  );

  const groupWeekRow = await db.query(
    `SELECT COALESCE(SUM(sl.steps), 0)::int AS total
     FROM step_logs sl
     JOIN users u ON u.id = sl.user_id
     WHERE u.group_id = $1
       AND sl.log_date BETWEEN $2::date AND $3::date`,
    [group_id, starts_on, ends_on],
  );

  // Daily rank
  const rankRow = await db.query(
    `SELECT COUNT(*) FILTER (WHERE sl.steps > me.steps)::int + 1 AS rank
     FROM step_logs sl
     JOIN users u ON u.id = sl.user_id
     CROSS JOIN (
       SELECT steps FROM step_logs WHERE user_id = $1 AND log_date = $2
     ) me
     WHERE u.group_id = $3 AND sl.log_date = $2`,
    [userId, date, group_id],
  );

  // target_hit_at for this day (used for hit_daily_target)
  const targetRow = await db.query(
    `SELECT target_hit_at, u.weekly_step_target
     FROM step_logs sl JOIN users u ON u.id = sl.user_id
     WHERE sl.user_id = $1 AND sl.log_date = $2`,
    [userId, date],
  );

  // daily_target_streak: consecutive days ending at `date` where target was hit
  const streakRow = await db.query(
    `WITH ordered AS (
       SELECT log_date,
              steps >= (u.weekly_step_target / 7.0) AS hit,
              ROW_NUMBER() OVER (ORDER BY log_date DESC) AS rn
       FROM step_logs sl JOIN users u ON u.id = sl.user_id
       WHERE sl.user_id = $1 AND sl.log_date <= $2::date
       ORDER BY log_date DESC
     )
     SELECT COUNT(*)::int AS streak
     FROM ordered
     WHERE hit AND rn = (
       SELECT MIN(o2.rn) FROM ordered o2 WHERE NOT o2.hit OR o2.rn = rn
     )`,
    [userId, date],
  );

  const log = logRow.rows[0];
  const ctx: DetectorContext = {
    steps: log ? Number(log.steps) : 0,
    workouts: log ? (log.workouts ?? []) : [],
    sleep_minutes: log?.sleep_minutes ?? null,
    active_zone_minutes: log?.active_zone_minutes ?? null,
    hr_zones: log?.hr_zones ?? null,
    group_week_steps: Number(groupWeekRow.rows[0]?.total ?? 0),
    daily_rank: rankRow.rows[0] ? Number(rankRow.rows[0].rank) : undefined,
    daily_target_streak: streakRow.rows[0] ? Number(streakRow.rows[0].streak) : 0,
    hit_daily_target: targetRow.rows[0]
      ? Number(log?.steps ?? 0) >= Number(targetRow.rows[0].weekly_step_target) / 7
      : false,
    weekday: new Date(`${date}T00:00:00Z`).getUTCDay() || 7, // 1=Mon…7=Sun
    // hot_pursuit: all group members worked out today
  };

  // Hot pursuit: everyone in the group has a workout today
  const hotRow = await db.query(
    `SELECT COUNT(u.id)::int AS members,
            COUNT(u.id) FILTER (
              WHERE COALESCE(jsonb_array_length(sl.workouts), 0) > 0
            )::int AS with_workout
     FROM users u
     LEFT JOIN step_logs sl ON sl.user_id = u.id AND sl.log_date = $2
     WHERE u.group_id = $1`,
    [group_id, date],
  );
  const hotRow0 = hotRow.rows[0];
  ctx.hot_pursuit =
    Number(hotRow0.members) > 0 && Number(hotRow0.members) === Number(hotRow0.with_workout);

  // Load challenge definitions for tiles that reference them
  const challengeIds = tiles
    .filter((t): t is Extract<BingoTile, { challenge_id: number }> => "challenge_id" in t)
    .map((t) => t.challenge_id);

  const challengeRows = await db.query(
    `SELECT id, detector, category
     FROM bingo_challenge_definitions WHERE id = ANY($1)`,
    [challengeIds],
  );
  const detectorMap = new Map(
    challengeRows.rows.map((r) => [Number(r.id), { detector: r.detector, category: r.category }]),
  );

  const weekWorkouts = Number(weekWorkoutsRow.rows[0]?.total ?? 0);

  const updatedTiles: BingoTile[] = tiles.map((tile) => {
    if ("free" in tile) return tile;
    if (tile.state === "complete") return tile; // never revert a completed tile

    const entry = detectorMap.get(tile.challenge_id);
    if (!entry) return tile;

    // week-scope workouts override
    const effectiveCtx: DetectorContext =
      entry.detector.window === "week"
        ? { ...ctx, workouts: Array.from({ length: weekWorkouts }, () => ({ start: "", duration_min: 0 })) }
        : ctx;

    const done = evaluateDetector(entry.detector, effectiveCtx);
    if (done) {
      return {
        ...tile,
        state: "complete" as const,
        completed_at: new Date().toISOString(),
      };
    }
    return tile;
  });

  const lines = countBingoLines(updatedTiles);
  const blackout = isBlackout(updatedTiles);

  await db.query(
    `UPDATE bingo_cards
     SET tiles = $1, bingo_lines = $2, blackout = $3
     WHERE id = $4`,
    [JSON.stringify(updatedTiles), lines, blackout, cardRow.rows[0].id],
  );
}
