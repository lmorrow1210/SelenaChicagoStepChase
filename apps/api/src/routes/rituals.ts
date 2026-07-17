import { Router } from "express";
import { ritualViewSchema } from "@one-step-ahead/shared";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";

export const ritualsRouter = Router();
ritualsRouter.use(requireAuth);

/**
 * Record that the viewer saw (or dismissed) a weekly ritual surface —
 * Monday briefing, midweek update, final push, case-closed report. The
 * product requires real persistence for `briefingViewedAt`, so this is a
 * table, not localStorage. Idempotent per (week, user, ritual).
 */
ritualsRouter.post("/view", async (req, res, next) => {
  try {
    const { week_id, ritual_id } = ritualViewSchema.parse(req.body);

    const week = await pool.query(
      `SELECT 1
       FROM weeks w
       JOIN users u ON u.group_id = w.group_id
       WHERE w.id = $1 AND u.id = $2`,
      [week_id, req.userId],
    );
    if (!week.rowCount) throw errors.notFound("No such week in your group");

    const inserted = await pool.query(
      `INSERT INTO week_ritual_views (week_id, user_id, ritual_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (week_id, user_id, ritual_id) DO UPDATE
         SET ritual_id = week_ritual_views.ritual_id
       RETURNING viewed_at`,
      [week_id, req.userId, ritual_id],
    );
    res.json({ ok: true, viewed_at: new Date(inserted.rows[0].viewed_at).toISOString() });
  } catch (e) {
    next(e);
  }
});
