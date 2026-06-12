import type { Pool, PoolClient } from "pg";
import { scorePredictions } from "./prediction.js";

/**
 * Score all predictions for a closed week and stamp the week as closed.
 * Idempotent: re-running on an already-closed week re-scores with the same
 * actuals (safe because group_total_steps is the authoritative source).
 */
export async function closeWeekPredictions(
  db: Pool | PoolClient,
  weekId: string,
): Promise<{ actualTotal: number; winnerId: string | null }> {
  const week = await db.query(
    `SELECT w.group_id, w.starts_on, w.ends_on, w.group_target_steps
     FROM weeks w WHERE w.id = $1`,
    [weekId],
  );
  if (!week.rowCount) throw new Error(`Week ${weekId} not found`);
  const { group_id, starts_on, ends_on, group_target_steps } = week.rows[0];

  const totalRow = await db.query(
    `SELECT COALESCE(SUM(sl.steps), 0)::int AS total
     FROM step_logs sl
     JOIN users u ON u.id = sl.user_id
     WHERE u.group_id = $1
       AND sl.log_date BETWEEN $2::date AND $3::date`,
    [group_id, starts_on, ends_on],
  );
  const actualTotal: number = Number(totalRow.rows[0].total);

  const preds = await db.query(
    `SELECT user_id, predicted_steps, submitted_at
     FROM predictions WHERE week_id = $1`,
    [weekId],
  );

  const scored = scorePredictions(
    preds.rows.map((r) => ({
      user_id: r.user_id as string,
      predicted_steps: Number(r.predicted_steps),
      submitted_at: new Date(r.submitted_at),
    })),
    actualTotal,
  );

  for (const s of scored) {
    await db.query(
      `UPDATE predictions SET actual_delta = $1, is_winner = $2
       WHERE week_id = $3 AND user_id = $4`,
      [s.actual_delta, s.is_winner, weekId, s.user_id],
    );
  }

  // $2 appears in two type contexts (assignment + comparison) — the explicit
  // casts keep Postgres from deducing inconsistent parameter types
  await db.query(
    `UPDATE weeks
     SET status = 'closed',
         group_total_steps = $2::int,
         target_hit = ($2::int >= $3::int)
     WHERE id = $1`,
    [weekId, actualTotal, group_target_steps],
  );

  const winner = scored.find((s) => s.is_winner);
  return { actualTotal, winnerId: winner?.user_id ?? null };
}
