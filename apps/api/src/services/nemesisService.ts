import type { Pool, PoolClient } from "pg";
import { decideDay, tallyScore, weekOutcome, pairPlayers } from "./nemesis.js";
import type { NemesisDayResult } from "@selenas-chase/shared";

type Db = Pool | PoolClient;

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000,
  );
}

/**
 * Monday pairing persistence (plan M6). Random pairs via `pairPlayers`;
 * odd member count → the bye player gets NO row (locked decision: absence
 * of a matchup row for the week means bye). Idempotent: if any matchups
 * already exist for the week, nothing new is inserted.
 */
export async function pairAndPersist(
  db: Db,
  weekId: string,
  groupId: string,
): Promise<{ matchupIds: string[]; bye: string | null }> {
  const existing = await db.query(
    `SELECT id, player_a, player_b FROM nemesis_matchups WHERE week_id = $1`,
    [weekId],
  );
  const members = await db.query(`SELECT id FROM users WHERE group_id = $1`, [groupId]);
  const memberIds: string[] = members.rows.map((r) => r.id);

  if (existing.rowCount) {
    const paired = new Set(
      existing.rows.flatMap((r) => [r.player_a as string, r.player_b as string]),
    );
    return {
      matchupIds: existing.rows.map((r) => r.id),
      bye: memberIds.find((id) => !paired.has(id)) ?? null,
    };
  }

  if (memberIds.length < 2) return { matchupIds: [], bye: memberIds[0] ?? null };

  const { pairs, bye } = pairPlayers(memberIds);
  const matchupIds: string[] = [];
  for (const [a, b] of pairs) {
    const inserted = await db.query(
      `INSERT INTO nemesis_matchups (week_id, player_a, player_b)
       VALUES ($1, $2, $3) RETURNING id`,
      [weekId, a, b],
    );
    matchupIds.push(inserted.rows[0].id);
  }
  return { matchupIds, bye };
}

/**
 * Close one calendar day of a matchup: decide the day's winner, upsert it
 * into daily_results, retally scores, and advance status. Mon–Fri days feed
 * the best-of-5; a 5-day tie sets status='tiebreak' with Saturday as sudden
 * death; the Saturday result (if not itself a tie) completes the matchup.
 * Idempotent: re-closing a date replaces its entry. No-op once complete.
 */
export async function closeDayForMatchup(db: Db, matchupId: string, date: string): Promise<void> {
  const m = await db.query(
    `SELECT nm.player_a, nm.player_b, nm.daily_results, nm.status,
            to_char(nm.tiebreaker_date, 'YYYY-MM-DD') AS tiebreaker_date,
            to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on
     FROM nemesis_matchups nm JOIN weeks w ON w.id = nm.week_id
     WHERE nm.id = $1`,
    [matchupId],
  );
  if (!m.rowCount) return;
  const row = m.rows[0];
  if (row.status === "complete") return;

  const dayIndex = diffDays(row.starts_on, date);
  const isWeekday = dayIndex >= 0 && dayIndex <= 4;
  const isTiebreakDay = row.status === "tiebreak" && row.tiebreaker_date === date;
  if (!isWeekday && !isTiebreakDay) return;

  const logs = await db.query(
    `SELECT user_id, steps, target_hit_at FROM step_logs
     WHERE log_date = $1 AND user_id = ANY($2)`,
    [date, [row.player_a, row.player_b]],
  );
  const byUser = new Map(logs.rows.map((r) => [r.user_id as string, r]));
  const a = byUser.get(row.player_a);
  const b = byUser.get(row.player_b);

  const result = decideDay({
    date,
    a_steps: a ? Number(a.steps) : 0,
    b_steps: b ? Number(b.steps) : 0,
    a_target_hit_at: a?.target_hit_at ?? null,
    b_target_hit_at: b?.target_hit_at ?? null,
  });

  const results: NemesisDayResult[] = (row.daily_results as NemesisDayResult[])
    .filter((r) => r.date !== date)
    .concat([result])
    .sort((x, y) => x.date.localeCompare(y.date));

  const weekdayEnd = addDays(row.starts_on, 4);
  const weekdayResults = results.filter((r) => r.date <= weekdayEnd);
  const { score_a, score_b } = tallyScore(results);

  let status = "active";
  let winnerId: string | null = null;
  let tiebreakerDate: string | null = row.tiebreaker_date;

  if (weekdayResults.length === 5) {
    const outcome = weekOutcome(weekdayResults);
    if (outcome === "a") {
      status = "complete";
      winnerId = row.player_a;
    } else if (outcome === "b") {
      status = "complete";
      winnerId = row.player_b;
    } else {
      tiebreakerDate = tiebreakerDate ?? addDays(row.starts_on, 5);
      const sat = results.find((r) => r.date === tiebreakerDate);
      if (sat && sat.winner !== "tie") {
        status = "complete";
        winnerId = sat.winner === "a" ? row.player_a : row.player_b;
      } else {
        status = "tiebreak";
      }
    }
  }

  await db.query(
    `UPDATE nemesis_matchups
     SET daily_results = $1, score_a = $2, score_b = $3,
         status = $4, winner_id = $5, tiebreaker_date = $6
     WHERE id = $7`,
    [JSON.stringify(results), score_a, score_b, status, winnerId, tiebreakerDate, matchupId],
  );
}

/**
 * Close every fully-elapsed day of a matchup (everything before `todayLocal`,
 * group-local). Lets the manual sync stub stand in for the midnight cron run
 * until M8 — same pattern as bingo detection in /api/sync/run.
 */
export async function closeElapsedDays(
  db: Db,
  matchupId: string,
  todayLocal: string,
): Promise<void> {
  const m = await db.query(
    `SELECT to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on
     FROM nemesis_matchups nm JOIN weeks w ON w.id = nm.week_id
     WHERE nm.id = $1`,
    [matchupId],
  );
  if (!m.rowCount) return;
  const startsOn: string = m.rows[0].starts_on;

  // Mon–Sat at most (index 0–5); Saturday only matters in tiebreak.
  for (let i = 0; i <= 5; i++) {
    const date = addDays(startsOn, i);
    if (date >= todayLocal) break;
    await closeDayForMatchup(db, matchupId, date);
  }
}
