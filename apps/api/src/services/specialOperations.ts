import type { Pool, PoolClient } from "pg";
import { getSeasonWeek } from "@one-step-ahead/shared/season-one/seasonOne";
import {
  calculateParticipationThreshold,
  operationWindowDates,
  type ParticipationThresholdState,
} from "@one-step-ahead/shared/season-one/specialOperations";

const EMPTY_STATE: ParticipationThresholdState = {
  id: "none",
  label: "Special Operation",
  active: false,
  contributors: 0,
  eligiblePlayers: 0,
  minimumVerifiedStepsPerPlayer: 0,
  earnedBonus: 0,
  maxBonus: 0,
  nextThresholdCount: null,
};

/**
 * Week 1 Platform Sweep (participation-threshold operation): each eligible
 * member contributes >= config.minimumVerifiedStepsPerPlayer verified steps
 * across the operation window (V1: the full Friday + Saturday local dates,
 * per the technical plan — real intraday windows wait on the Health API
 * smoke test). Derived entirely from step_logs; nothing extra is persisted
 * until the weekly result snapshot at rollover.
 */
export async function getSpecialOperationState(
  db: Pool | PoolClient,
  weekId: string,
  localToday: string,
): Promise<ParticipationThresholdState> {
  const weekRow = await db.query(
    `SELECT w.group_id,
            to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on,
            c.route_order, c.name AS city_name
     FROM weeks w JOIN cities c ON c.id = w.city_id
     WHERE w.id = $1`,
    [weekId],
  );
  if (!weekRow.rowCount) return EMPTY_STATE;
  const week = weekRow.rows[0];

  const seasonWeek = getSeasonWeek(Number(week.route_order));
  if (!seasonWeek || seasonWeek.cityName !== week.city_name) return EMPTY_STATE;

  const config = seasonWeek.specialOperation;
  const windowDates = operationWindowDates(config, week.starts_on);
  if (!windowDates.length) return EMPTY_STATE;

  const row = await db.query(
    `SELECT COUNT(u.id)::int AS eligible,
            COUNT(u.id) FILTER (WHERE COALESCE(sl.window_steps, 0) >= $3)::int AS contributors
     FROM users u
     LEFT JOIN (
       SELECT user_id, SUM(steps)::int AS window_steps
       FROM step_logs
       WHERE log_date = ANY($2::date[])
       GROUP BY user_id
     ) sl ON sl.user_id = u.id
     WHERE u.group_id = $1`,
    [week.group_id, windowDates, config.minimumVerifiedStepsPerPlayer],
  );

  return calculateParticipationThreshold(config, {
    contributors: Number(row.rows[0]?.contributors ?? 0),
    eligiblePlayers: Number(row.rows[0]?.eligible ?? 0),
    active: windowDates.includes(localToday),
  });
}
