import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

const markReadSchema = z.object({
  ids: z.array(z.number().int()).max(100).optional(),
});

notificationsRouter.get("/", async (req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT id, kind, message, read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY read ASC, created_at DESC
       LIMIT 20`,
      [req.userId],
    );
    res.json({ notifications: r.rows });
  } catch (e) {
    next(e);
  }
});

notificationsRouter.post("/read", async (req, res, next) => {
  try {
    const { ids } = markReadSchema.parse(req.body ?? {});
    if (ids?.length) {
      await pool.query(
        `UPDATE notifications SET read = TRUE WHERE user_id = $1 AND id = ANY($2)`,
        [req.userId, ids],
      );
    } else {
      await pool.query(`UPDATE notifications SET read = TRUE WHERE user_id = $1`, [req.userId]);
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
