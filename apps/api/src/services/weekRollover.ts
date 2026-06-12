import type { Pool, PoolClient } from "pg";
import { closeWeekPredictions } from "./weekClose.js";
import { closeDayForMatchup, pairAndPersist } from "./nemesisService.js";
import { createOrGetBingoCard } from "./bingoService.js";

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function awardBadge(
  client: PoolClient,
  userId: string,
  code: string,
  weekId: string,
  cityId: number | null,
  quality: "bronze" | "silver" | "gold" | null,
): Promise<void> {
  await client.query(
    `INSERT INTO badges (user_id, badge_code, week_id, city_id, quality)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, badge_code, week_id) DO NOTHING`,
    [userId, code, weekId, cityId, quality],
  );
}

/**
 * Monday 00:00 rollover (plan M8): close the week, award badges, freeze
 * bingo, then open the next week with fresh cards and nemesis pairings.
 * Runs in a single transaction — partial failure rolls everything back.
 * Idempotent: badges/weeks/cards/matchups all upsert-or-skip on rerun.
 */
export async function weekRollover(
  pool: Pool,
  weekId: string,
): Promise<{ nextWeekId: string }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const weekRow = await client.query(
      `SELECT w.group_id, w.city_id, w.target_hit,
              to_char(w.starts_on, 'YYYY-MM-DD') AS starts_on,
              to_char(w.ends_on, 'YYYY-MM-DD') AS ends_on,
              c.route_order
       FROM weeks w JOIN cities c ON c.id = w.city_id
       WHERE w.id = $1`,
      [weekId],
    );
    if (!weekRow.rowCount) throw new Error(`Week ${weekId} not found`);
    const week = weekRow.rows[0];
    const groupId: string = week.group_id;
    const startsOn: string = week.starts_on;
    const endsOn: string = week.ends_on;

    // 1. Close predictions + stamp week closed/target_hit; award the winner.
    const { winnerId: predictionWinner } = await closeWeekPredictions(client, weekId);
    if (predictionWinner) {
      await awardBadge(client, predictionWinner, "prediction_win", weekId, null, null);
    }

    const targetHitRow = await client.query(`SELECT target_hit FROM weeks WHERE id = $1`, [
      weekId,
    ]);
    const targetHit: boolean = !!targetHitRow.rows[0].target_hit;

    // 2. City badge: step leader, quality by unlock count, only if target hit.
    const leaderRow = await client.query(
      `SELECT u.id, COALESCE(SUM(sl.steps), 0)::int AS steps
       FROM users u
       LEFT JOIN step_logs sl ON sl.user_id = u.id
         AND sl.log_date BETWEEN $2::date AND $3::date
       WHERE u.group_id = $1
       GROUP BY u.id
       ORDER BY COALESCE(SUM(sl.steps), 0) DESC, u.created_at ASC
       LIMIT 1`,
      [groupId, startsOn, endsOn],
    );
    const leaderId: string | null =
      leaderRow.rowCount && Number(leaderRow.rows[0].steps) > 0 ? leaderRow.rows[0].id : null;

    if (leaderId && targetHit) {
      const unlockRow = await client.query(
        `SELECT COUNT(*)::int AS n FROM city_unlocks WHERE week_id = $1 AND unlocked`,
        [weekId],
      );
      const unlocks = Number(unlockRow.rows[0].n);
      const quality = unlocks >= 6 ? "gold" : unlocks >= 3 ? "silver" : "bronze";
      await awardBadge(client, leaderId, "city", weekId, week.city_id, quality);

      // 3. Streak badges: consecutive closed weeks (ending here) won by leader.
      const streakRows = await client.query(
        `SELECT EXISTS (
           SELECT 1 FROM badges b
           WHERE b.user_id = $2 AND b.badge_code = 'city' AND b.week_id = w.id
         ) AS won
         FROM weeks w
         WHERE w.group_id = $1 AND w.status = 'closed' AND w.starts_on <= $3::date
         ORDER BY w.starts_on DESC`,
        [groupId, leaderId, startsOn],
      );
      let streak = 0;
      for (const r of streakRows.rows) {
        if (!r.won) break;
        streak++;
      }
      for (const n of [3, 6, 12]) {
        if (streak === n) await awardBadge(client, leaderId, `streak_${n}`, weekId, null, null);
      }
    }

    // 4. Finalize nemesis matchups: close Mon–Fri (+ Saturday tiebreak), then
    // force-complete any still-unresolved matchup by weekly step total.
    const matchups = await client.query(
      `SELECT id FROM nemesis_matchups WHERE week_id = $1`,
      [weekId],
    );
    for (const { id: matchupId } of matchups.rows) {
      for (let i = 0; i <= 4; i++) {
        await closeDayForMatchup(client, matchupId, addDays(startsOn, i));
      }
      await closeDayForMatchup(client, matchupId, addDays(startsOn, 5)); // Saturday, if tiebreak

      const m = await client.query(
        `SELECT player_a, player_b, status, winner_id FROM nemesis_matchups WHERE id = $1`,
        [matchupId],
      );
      let { player_a, player_b, status, winner_id } = m.rows[0];
      if (status !== "complete") {
        // Sudden death tied too (or never resolved): weekly total decides; a
        // dead-even week is a draw with no winner.
        const totals = await client.query(
          `SELECT user_id, COALESCE(SUM(steps), 0)::int AS total
           FROM step_logs
           WHERE user_id = ANY($1) AND log_date BETWEEN $2::date AND $3::date
           GROUP BY user_id`,
          [[player_a, player_b], startsOn, endsOn],
        );
        const byUser = new Map(totals.rows.map((r) => [r.user_id as string, Number(r.total)]));
        const aTotal = byUser.get(player_a) ?? 0;
        const bTotal = byUser.get(player_b) ?? 0;
        winner_id = aTotal > bTotal ? player_a : bTotal > aTotal ? player_b : null;
        await client.query(
          `UPDATE nemesis_matchups SET status = 'complete', winner_id = $2 WHERE id = $1`,
          [matchupId, winner_id],
        );
      }
      if (winner_id) {
        await awardBadge(client, winner_id, "nemesis_victor", weekId, null, null);
      }
    }

    // 5. Bingo: freeze cards and award line/blackout badges.
    const cards = await client.query(
      `SELECT user_id, bingo_lines, blackout FROM bingo_cards WHERE week_id = $1`,
      [weekId],
    );
    await client.query(`UPDATE bingo_cards SET frozen = TRUE WHERE week_id = $1`, [weekId]);
    for (const c of cards.rows) {
      if (Number(c.bingo_lines) > 0) {
        await awardBadge(client, c.user_id, "bingo", weekId, null, null);
      }
      if (c.blackout) {
        await awardBadge(client, c.user_id, "blackout", weekId, null, null);
      }
    }

    // 6. Perfect week: hit the daily target (weekly/7) all 7 days.
    const perfect = await client.query(
      `SELECT u.id
       FROM users u
       WHERE u.group_id = $1
         AND 7 = (
           SELECT COUNT(*) FROM step_logs sl
           WHERE sl.user_id = u.id
             AND sl.log_date BETWEEN $2::date AND $3::date
             AND sl.steps >= u.weekly_step_target / 7.0
         )`,
      [groupId, startsOn, endsOn],
    );
    for (const r of perfect.rows) {
      await awardBadge(client, r.id, "perfect_week", weekId, null, null);
    }

    // 7. Hot pursuit: any day this week where every member logged a workout.
    const hot = await client.query(
      `SELECT 1
       FROM generate_series($2::date, $3::date, '1 day') AS d(day)
       WHERE (SELECT COUNT(*) FROM users WHERE group_id = $1) > 0
         AND (SELECT COUNT(*) FROM users WHERE group_id = $1) = (
           SELECT COUNT(*) FROM users u
           JOIN step_logs sl ON sl.user_id = u.id AND sl.log_date = d.day
           WHERE u.group_id = $1 AND COALESCE(jsonb_array_length(sl.workouts), 0) > 0
         )
       LIMIT 1`,
      [groupId, startsOn, endsOn],
    );
    if (hot.rowCount) {
      const members = await client.query(`SELECT id FROM users WHERE group_id = $1`, [groupId]);
      for (const r of members.rows) {
        await awardBadge(client, r.id, "hot_pursuit", weekId, null, null);
      }
    }

    // 8. Create next week: next city on the route (wrap), Σ member targets.
    const nextCity = await client.query(
      `SELECT id FROM cities
       WHERE route_order > $1
       ORDER BY route_order ASC LIMIT 1`,
      [week.route_order],
    );
    const nextCityId: number = nextCity.rowCount
      ? nextCity.rows[0].id
      : (await client.query(`SELECT id FROM cities ORDER BY route_order ASC LIMIT 1`)).rows[0].id;

    const target = await client.query(
      `SELECT COALESCE(SUM(weekly_step_target), 0)::int AS total
       FROM users WHERE group_id = $1`,
      [groupId],
    );
    const nextMonday = addDays(endsOn, 1);
    const nextWeek = await client.query(
      `INSERT INTO weeks (group_id, city_id, starts_on, ends_on, group_target_steps)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (group_id, starts_on) DO UPDATE SET group_id = weeks.group_id
       RETURNING id`,
      [groupId, nextCityId, nextMonday, addDays(nextMonday, 6), target.rows[0].total],
    );
    const nextWeekId: string = nextWeek.rows[0].id;

    // 9. Fresh bingo cards + nemesis pairings; prediction window opens
    // implicitly with the new active week.
    const members = await client.query(`SELECT id FROM users WHERE group_id = $1`, [groupId]);
    for (const r of members.rows) {
      await createOrGetBingoCard(client, nextWeekId, r.id);
    }
    await pairAndPersist(client, nextWeekId, groupId);

    await client.query("COMMIT");
    return { nextWeekId };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
