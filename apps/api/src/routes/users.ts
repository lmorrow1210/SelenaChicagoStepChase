import { Router } from "express";
import { updateMeSchema } from "@one-step-ahead/shared";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { OAuth2Client } from "google-auth-library";
import { decryptToken } from "../lib/crypto.js";
import { clearSessionCookie } from "../lib/session.js";
import { deleteAccount } from "../services/accountDeletion.js";

export const usersRouter = Router();
usersRouter.use(requireAuth);

const PROFILE_FIELDS = `id, email, display_name, group_id, weekly_step_target,
  avatar_skin, avatar_hair, avatar_colorway, objective_prefs, fitbit_connected, last_synced_at, created_at`;

usersRouter.get("/me", async (req, res, next) => {
  try {
    const r = await pool.query(`SELECT ${PROFILE_FIELDS} FROM users WHERE id = $1`, [req.userId]);
    if (!r.rowCount) throw errors.unauthenticated();
    res.json({ user: r.rows[0] });
  } catch (e) {
    next(e);
  }
});

usersRouter.get("/me/stats", async (req, res, next) => {
  try {
    const me = await pool.query(`SELECT group_id FROM users WHERE id = $1`, [req.userId]);
    if (!me.rowCount) throw errors.unauthenticated();
    const groupId = me.rows[0].group_id as string | null;

    const week = groupId
      ? await pool.query(
          `SELECT starts_on, ends_on FROM weeks
           WHERE group_id = $1 AND status = 'active'
           ORDER BY starts_on DESC LIMIT 1`,
          [groupId],
        )
      : null;

    const [alltime, thisWeek, cityWins, bingoLines] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(steps), 0)::bigint AS total FROM step_logs WHERE user_id = $1`,
        [req.userId],
      ),
      week?.rowCount
        ? pool.query(
            `SELECT COALESCE(SUM(steps), 0)::int AS total FROM step_logs
             WHERE user_id = $1 AND log_date BETWEEN $2::date AND $3::date`,
            [req.userId, week.rows[0].starts_on, week.rows[0].ends_on],
          )
        : Promise.resolve(null),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM badges WHERE user_id = $1 AND badge_code = 'city'`,
        [req.userId],
      ),
      pool.query(
        `SELECT COALESCE(SUM(bingo_lines), 0)::int AS total FROM bingo_cards WHERE user_id = $1`,
        [req.userId],
      ),
    ]);

    // Current streak: consecutive most-recent closed weeks with a city badge
    let currentStreak = 0;
    if (groupId) {
      const closedWeeks = await pool.query(
        `SELECT w.id, EXISTS (
           SELECT 1 FROM badges b
           WHERE b.user_id = $2 AND b.badge_code = 'city' AND b.week_id = w.id
         ) AS won
         FROM weeks w
         WHERE w.group_id = $1 AND w.status = 'closed'
         ORDER BY w.starts_on DESC`,
        [groupId, req.userId],
      );
      for (const row of closedWeeks.rows) {
        if (!row.won) break;
        currentStreak++;
      }
    }

    res.json({
      total_steps_alltime: Number(alltime.rows[0].total),
      total_steps_this_week: thisWeek ? Number(thisWeek.rows[0].total) : 0,
      city_wins: Number(cityWins.rows[0].n),
      bingo_lines_alltime: Number(bingoLines.rows[0].total),
      current_streak: currentStreak,
    });
  } catch (e) {
    next(e);
  }
});

usersRouter.patch("/me", async (req, res, next) => {
  try {
    const patch = updateMeSchema.parse(req.body);
    const keys = Object.keys(patch) as (keyof typeof patch)[];
    if (!keys.length) throw errors.validation("Nothing to update");
    const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const r = await pool.query(
      `UPDATE users SET ${sets} WHERE id = $1 RETURNING ${PROFILE_FIELDS}`,
      [req.userId, ...keys.map((k) => patch[k])],
    );
    res.json({ user: r.rows[0] });
  } catch (e) {
    next(e);
  }
});

/** Best effort: the token is already gone from our database either way. */
async function revokeAtGoogle(refreshTokenEnc: Buffer): Promise<void> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return;
  try {
    await new OAuth2Client(clientId, clientSecret).revokeToken(decryptToken(refreshTokenEnc));
  } catch {
    // Google unreachable or token already invalid — deletion still stands.
  }
}

// Permanently delete my account and everything recorded about me. Requires
// an explicit confirmation string so a stray or replayed request cannot do it.
usersRouter.delete("/me", async (req, res, next) => {
  try {
    if (req.body?.confirm !== "DELETE") {
      throw errors.validation('Send { "confirm": "DELETE" } to permanently delete your account');
    }
    const result = await deleteAccount(pool, req.userId!);
    clearSessionCookie(res);
    if (!result.deleted) throw errors.unauthenticated();
    if (result.refreshTokenEnc) await revokeAtGoogle(result.refreshTokenEnc);
    console.log(`account deleted: user ${req.userId}`);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
