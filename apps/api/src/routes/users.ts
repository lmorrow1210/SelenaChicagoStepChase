import { Router } from "express";
import { updateMeSchema } from "@selenas-chase/shared";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";

export const usersRouter = Router();
usersRouter.use(requireAuth);

const PROFILE_FIELDS = `id, email, display_name, group_id, weekly_step_target,
  avatar_skin, avatar_hair, avatar_colorway, fitbit_connected, last_synced_at, created_at`;

usersRouter.get("/me", async (req, res, next) => {
  try {
    const r = await pool.query(`SELECT ${PROFILE_FIELDS} FROM users WHERE id = $1`, [req.userId]);
    if (!r.rowCount) throw errors.unauthenticated();
    res.json({ user: r.rows[0] });
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
