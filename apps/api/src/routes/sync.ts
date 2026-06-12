import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { MockFitbitClient, type FitbitClient } from "../services/fitbitClient.js";
import { syncUserToday } from "../services/sync.js";
import { detectUnlocks } from "../services/unlocks.js";
import { createOrGetBingoCard, updateBingoCard } from "../services/bingoService.js";

// M2 sync stub: manual "sync now" against the mock client. M8 swaps the
// client for the real Health API implementation — this route is unchanged.
const fitbit: FitbitClient = new MockFitbitClient();

export const syncRouter = Router();
syncRouter.use(requireAuth);

const syncLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 1,
  keyGenerator: (req) => req.userId ?? req.ip ?? "anon",
  handler: (_req, res) =>
    res.status(429).json({
      error: { code: "RATE_LIMITED", message: "Sync runs at most once every 10 minutes" },
    }),
});

syncRouter.post("/run", syncLimit, async (req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT u.id, u.group_id, COALESCE(g.timezone, 'America/Chicago') AS timezone
       FROM users u LEFT JOIN groups g ON g.id = u.group_id
       WHERE u.id = $1`,
      [req.userId],
    );
    if (!r.rowCount) throw errors.unauthenticated();
    const date = await syncUserToday(pool, fitbit, r.rows[0].id, r.rows[0].timezone);
    if (r.rows[0].group_id) {
      const groupId = r.rows[0].group_id as string;
      await detectUnlocks(pool, groupId, date, r.rows[0].id);

      // Bingo: ensure card exists then re-evaluate all tiles for today
      const weekRow = await pool.query(
        `SELECT id FROM weeks WHERE group_id = $1 AND status = 'active'
         ORDER BY starts_on DESC LIMIT 1`,
        [groupId],
      );
      if (weekRow.rowCount) {
        const weekId = weekRow.rows[0].id as string;
        await createOrGetBingoCard(pool, weekId, r.rows[0].id);
        await updateBingoCard(pool, weekId, r.rows[0].id, date);
      }
    }
    res.json({ ok: true, syncedAt: new Date().toISOString() });
  } catch (e) {
    next(e);
  }
});
