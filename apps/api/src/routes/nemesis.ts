import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { localDateParts } from "../services/week.js";
import { pairAndPersist } from "../services/nemesisService.js";

export const nemesisRouter = Router();
nemesisRouter.use(requireAuth);

interface MatchupRow {
  id: string;
  player_a: string;
  player_b: string;
  score_a: number;
  score_b: number;
  status: "active" | "tiebreak" | "complete";
  daily_results: unknown[];
  rerolled: boolean;
  tiebreaker_date: string | null;
  winner_id: string | null;
}

const MATCHUP_COLS = `
  nm.id, nm.player_a, nm.player_b, nm.score_a::int AS score_a, nm.score_b::int AS score_b,
  nm.status, nm.daily_results, nm.rerolled,
  to_char(nm.tiebreaker_date, 'YYYY-MM-DD') AS tiebreaker_date, nm.winner_id`;

async function currentWeekAndGroup(userId: string) {
  const me = await pool.query(
    `SELECT u.group_id, COALESCE(g.timezone, 'America/Chicago') AS timezone
     FROM users u LEFT JOIN groups g ON g.id = u.group_id
     WHERE u.id = $1`,
    [userId],
  );
  if (!me.rowCount) throw errors.unauthenticated();
  const groupId = me.rows[0].group_id as string | null;
  if (!groupId) throw errors.notFound("You're not in a group");

  const week = await pool.query(
    `SELECT id, to_char(starts_on, 'YYYY-MM-DD') AS starts_on,
            to_char(ends_on, 'YYYY-MM-DD') AS ends_on
     FROM weeks WHERE group_id = $1 AND status = 'active'
     ORDER BY starts_on DESC LIMIT 1`,
    [groupId],
  );
  if (!week.rowCount) throw errors.notFound("No active week");

  return {
    groupId,
    timezone: me.rows[0].timezone as string,
    weekId: week.rows[0].id as string,
    startsOn: week.rows[0].starts_on as string,
    endsOn: week.rows[0].ends_on as string,
  };
}

function todayLocal(timezone: string): string {
  const { y, m, d } = localDateParts(new Date(), timezone);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

nemesisRouter.get("/current", async (req, res, next) => {
  try {
    const { groupId, timezone, weekId, startsOn, endsOn } = await currentWeekAndGroup(
      req.userId!,
    );

    // Lazy Monday pairing: first /current request of the week pairs everyone.
    await pairAndPersist(pool, weekId, groupId);

    const matchupRow = await pool.query<MatchupRow>(
      `SELECT ${MATCHUP_COLS}
       FROM nemesis_matchups nm
       WHERE nm.week_id = $1 AND (nm.player_a = $2 OR nm.player_b = $2)`,
      [weekId, req.userId],
    );

    const today = todayLocal(timezone);

    const weekMaxRow = await pool.query(
      `SELECT COALESCE(MAX(sl.steps), 0)::int AS max
       FROM step_logs sl JOIN users u ON u.id = sl.user_id
       WHERE u.group_id = $1 AND sl.log_date BETWEEN $2::date AND $3::date`,
      [groupId, startsOn, endsOn],
    );
    const weekMax = Number(weekMaxRow.rows[0].max);

    if (!matchupRow.rowCount) {
      const memberCount = await pool.query(
        `SELECT COUNT(*)::int AS n FROM users WHERE group_id = $1`,
        [groupId],
      );
      res.json({
        matchup: null,
        you: null,
        nemesis: null,
        week: { starts_on: startsOn, ends_on: endsOn },
        today,
        weekMax,
        outcome: null,
        state: Number(memberCount.rows[0].n) < 2 ? "no_matchup" : "bye",
      });
      return;
    }

    const matchup = matchupRow.rows[0];
    const players = await pool.query(
      `SELECT u.id AS user_id, u.display_name, u.avatar_skin, u.avatar_hair, u.avatar_colorway,
              COALESCE((SELECT steps FROM step_logs
                        WHERE user_id = u.id AND log_date = $2::date), 0)::int AS steps_today,
              COALESCE((SELECT SUM(steps) FROM step_logs
                        WHERE user_id = u.id
                          AND log_date BETWEEN $3::date AND $4::date), 0)::int AS steps_this_week
       FROM users u WHERE u.id = ANY($1)`,
      [[matchup.player_a, matchup.player_b], today, startsOn, endsOn],
    );
    const byId = new Map(players.rows.map((r) => [r.user_id as string, r]));
    const you = byId.get(req.userId!);
    const nemesis = byId.get(
      matchup.player_a === req.userId ? matchup.player_b : matchup.player_a,
    );

    const outcome =
      matchup.status === "complete"
        ? matchup.winner_id === matchup.player_a
          ? "a"
          : "b"
        : matchup.status === "tiebreak"
          ? "tiebreak"
          : null;

    res.json({
      matchup,
      you,
      nemesis,
      week: { starts_on: startsOn, ends_on: endsOn },
      today,
      weekMax,
      outcome,
      state: matchup.status,
    });
  } catch (e) {
    next(e);
  }
});

nemesisRouter.post("/reroll", async (req, res, next) => {
  try {
    const { groupId, weekId } = await currentWeekAndGroup(req.userId!);

    const mine = await pool.query<MatchupRow>(
      `SELECT ${MATCHUP_COLS}
       FROM nemesis_matchups nm
       WHERE nm.week_id = $1 AND (nm.player_a = $2 OR nm.player_b = $2)`,
      [weekId, req.userId],
    );
    if (!mine.rowCount) throw errors.notFound("No matchup this week");
    const old = mine.rows[0];
    if (old.rerolled) throw errors.conflict("REROLL_USED", "You already rerolled this week");

    const oldOpponent = old.player_a === req.userId ? old.player_b : old.player_a;

    // Candidates: group members with no matchup this week (the bye player),
    // excluding the current opponent — a reroll must change your nemesis.
    const candidates = await pool.query(
      `SELECT u.id FROM users u
       WHERE u.group_id = $1
         AND u.id NOT IN ($2, $3)
         AND NOT EXISTS (
           SELECT 1 FROM nemesis_matchups nm
           WHERE nm.week_id = $4 AND (nm.player_a = u.id OR nm.player_b = u.id)
         )`,
      [groupId, req.userId, oldOpponent, weekId],
    );
    if (!candidates.rowCount) {
      throw errors.conflict("REROLL_UNAVAILABLE", "No other player is available to face");
    }
    const partner = candidates.rows[Math.floor(Math.random() * candidates.rowCount)].id as string;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM nemesis_matchups WHERE id = $1`, [old.id]);
      // Old opponent becomes the bye player for the rest of the week.
      const inserted = await client.query<MatchupRow>(
        `INSERT INTO nemesis_matchups (week_id, player_a, player_b, rerolled)
         VALUES ($1, $2, $3, TRUE)
         RETURNING id, player_a, player_b, score_a::int AS score_a, score_b::int AS score_b,
                   status, daily_results, rerolled,
                   to_char(tiebreaker_date, 'YYYY-MM-DD') AS tiebreaker_date, winner_id`,
        [weekId, req.userId, partner],
      );
      await client.query("COMMIT");
      res.json({ matchup: inserted.rows[0] });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    next(e);
  }
});
