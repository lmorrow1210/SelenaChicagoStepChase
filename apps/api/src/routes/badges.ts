import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

export const badgesRouter = Router();
badgesRouter.use(requireAuth);

badgesRouter.get("/", async (req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT b.id, b.badge_code AS code, bd.label, bd.description,
              b.quality, b.city_id, c.name AS city_name, b.earned_at
       FROM badges b
       JOIN badge_definitions bd ON bd.code = b.badge_code
       LEFT JOIN cities c ON c.id = b.city_id
       WHERE b.user_id = $1
       ORDER BY b.earned_at DESC`,
      [req.userId],
    );
    res.json({ badges: r.rows });
  } catch (e) {
    next(e);
  }
});
