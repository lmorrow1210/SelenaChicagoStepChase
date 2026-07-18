import type { Pool, PoolClient } from "pg";
import { calculateChase, type ChaseCalculationResult } from "@one-step-ahead/shared/season-one/chase";
import { calculateDataConfidence } from "@one-step-ahead/shared/season-one/dataConfidence";
import type { DataConfidence } from "@one-step-ahead/shared";
import type { SeasonWeekConfig } from "@one-step-ahead/shared/season-one/seasonOne";
import { getSpecialOperationState } from "./specialOperations.js";
import { seasonWeekForRouteOrder, unlockWeekEvidence } from "./evidenceService.js";

type Db = Pool | PoolClient;

export interface WeekChaseComputation {
  chase: ChaseCalculationResult;
  dataConfidence: DataConfidence;
  seasonWeek: SeasonWeekConfig | null;
  groupId: string;
  startsOn: string;
  endsOn: string;
}

/**
 * Assemble the authoritative Chase Calculation inputs for a week from the
 * database and run the shared calculator. This is the single close-time
 * source of truth — weekRollover and late-sync reconciliation both call it,
 * so the API and the case-close UI can never disagree on outcome logic.
 */
export async function computeWeekChase(
  db: Db,
  weekId: string,
  opts: { now: Date; final: boolean },
): Promise<WeekChaseComputation> {
  const weekRow = await db.query(
    `SELECT w.group_id, w.group_target_steps,
            to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on,
            to_char(w.ends_on, 'YYYY-MM-DD') AS ends_on,
            c.route_order, c.name AS city_name
     FROM weeks w JOIN cities c ON c.id = w.city_id
     WHERE w.id = $1`,
    [weekId],
  );
  if (!weekRow.rowCount) throw new Error(`Week ${weekId} not found`);
  const week = weekRow.rows[0];
  const groupId: string = week.group_id;

  const [members, fieldOps, prediction, nemesis, specialOperation] = await Promise.all([
    db.query(
      `SELECT u.id, u.weekly_step_target, u.fitbit_connected, u.last_synced_at,
              COALESCE(sl.steps, 0)::int AS steps
       FROM users u
       LEFT JOIN (
         SELECT user_id, SUM(steps)::int AS steps
         FROM step_logs
         WHERE log_date BETWEEN $2::date AND $3::date
         GROUP BY user_id
       ) sl ON sl.user_id = u.id
       WHERE u.group_id = $1`,
      [groupId, week.starts_on, week.ends_on],
    ),
    db.query(
      `SELECT COALESCE(SUM(bingo_lines), 0)::int AS total_qualifying_lines
       FROM bingo_cards WHERE week_id = $1`,
      [weekId],
    ),
    db.query(`SELECT COUNT(*)::int AS submitted FROM predictions WHERE week_id = $1`, [weekId]),
    db.query(
      `SELECT COUNT(*)::int AS matchup_count,
              COUNT(*) FILTER (WHERE status IN ('active','tiebreak'))::int AS unresolved
       FROM nemesis_matchups WHERE week_id = $1`,
      [weekId],
    ),
    getSpecialOperationState(db, weekId, week.ends_on),
  ]);

  const activePlayerCount = members.rowCount ?? 0;
  const membersWithActivity = members.rows.filter((row) => Number(row.steps) > 0).length;
  const confidence = calculateDataConfidence({
    now: opts.now,
    trackers: members.rows.map((row) => ({
      userId: row.id as string,
      fitbitConnected: Boolean(row.fitbit_connected),
      lastSyncedAt: row.last_synced_at ?? null,
    })),
  });

  const chase = calculateChase({
    activePlayers: members.rows.map((row) => ({
      userId: row.id as string,
      weeklyTarget: Number(row.weekly_step_target),
      stepsThisWeek: Number(row.steps),
      lastSyncedAt: row.last_synced_at ?? null,
      fitbitConnected: Boolean(row.fitbit_connected),
    })),
    fieldOps: {
      activePlayerCount,
      totalQualifyingLines: Number(fieldOps.rows[0]?.total_qualifying_lines ?? 0),
    },
    specialOperation: {
      maxBonus: specialOperation.maxBonus,
      earnedBonus: specialOperation.earnedBonus,
      contributors: specialOperation.contributors,
      eligiblePlayers: specialOperation.eligiblePlayers,
    },
    nemesis: {
      activePlayerCount,
      participantsWithActivity: membersWithActivity,
      allMatchupsResolved:
        Number(nemesis.rows[0]?.matchup_count ?? 0) > 0 && Number(nemesis.rows[0]?.unresolved ?? 0) === 0,
    },
    prediction: { activePlayerCount, submittedCount: Number(prediction.rows[0]?.submitted ?? 0) },
    trackerSync: confidence.trackers,
    elapsedFractionOfWeek: opts.final ? 1 : 0,
    now: opts.now,
    groupWeeklyTargetSnapshot: Number(week.group_target_steps),
    dataConfidence: confidence.dataConfidence,
    final: opts.final,
  });

  return {
    chase,
    dataConfidence: confidence.dataConfidence,
    seasonWeek: seasonWeekForRouteOrder(Number(week.route_order), week.city_name),
    groupId,
    startsOn: week.starts_on,
    endsOn: week.ends_on,
  };
}

/**
 * Persist the authoritative weekly result on `weeks` and unlock evidence.
 * Idempotent: re-running writes the same values and the evidence upsert
 * skips existing rows. Returns whether the outcome changed versus what was
 * already stored (used by late-sync reconciliation to decide whether the
 * result materially moved).
 */
export async function finalizeWeekChase(
  db: Db,
  weekId: string,
  opts: { now: Date },
): Promise<{ outcomeChanged: boolean; computation: WeekChaseComputation }> {
  const computation = await computeWeekChase(db, weekId, { now: opts.now, final: true });
  const { chase, seasonWeek, groupId } = computation;
  const outcome = chase.finalOutcome;

  const prior = await db.query(
    `SELECT final_outcome, finalized_at FROM weeks WHERE id = $1`,
    [weekId],
  );
  const priorOutcome: string | null = prior.rows[0]?.final_outcome ?? null;
  const outcomeChanged = priorOutcome !== null && priorOutcome !== outcome;

  await db.query(
    `UPDATE weeks
     SET season_id = $2,
         season_week_number = $3,
         base_progress = $4,
         final_progress = $5,
         remaining_lead = $6,
         bonus_breakdown = $7::jsonb,
         data_confidence = $8,
         final_outcome = $9,
         finalized_at = COALESCE(finalized_at, $10)
     WHERE id = $1`,
    [
      weekId,
      seasonWeek?.seasonId ?? null,
      seasonWeek?.weekNumber ?? null,
      round4(chase.baseProgress),
      round4(chase.finalProgress),
      chase.remainingLead,
      JSON.stringify(chase.bonuses),
      computation.dataConfidence,
      outcome,
      opts.now.toISOString(),
    ],
  );

  if (seasonWeek && outcome) {
    await unlockWeekEvidence(db, weekId, groupId, seasonWeek, outcome);
  }

  return { outcomeChanged, computation };
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
