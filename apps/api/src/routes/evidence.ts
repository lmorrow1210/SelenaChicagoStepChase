import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { getEvidenceBoard } from "../services/evidenceService.js";

export const evidenceRouter = Router();
evidenceRouter.use(requireAuth);

/**
 * The group's Season One Evidence Board: 13 slots, locked/unlocked state,
 * weekly outcome markers, interception count, and finale depth tier.
 * Group-scoped; locked slots never leak evidence content.
 */
evidenceRouter.get("/", async (req, res, next) => {
  try {
    const me = await pool.query(`SELECT group_id FROM users WHERE id = $1`, [req.userId]);
    if (!me.rowCount) throw errors.unauthenticated();
    const groupId: string | null = me.rows[0].group_id;
    if (!groupId) throw errors.notFound("Join a group to open the evidence board");

    res.json(await getEvidenceBoard(pool, groupId));
  } catch (e) {
    next(e);
  }
});
