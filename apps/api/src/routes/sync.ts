import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { getFitbitClient } from "../services/clientFactory.js";
import { syncUserToday } from "../services/sync.js";
import { detectUnlocks } from "../services/unlocks.js";
import { createOrGetBingoCard, updateBingoCard } from "../services/bingoService.js";
import { closeElapsedDays } from "../services/nemesisService.js";

// Manual "sync now". Shares the process-wide client with the cron:
// real Health API in production, mock elsewhere (HEALTH_API_MODE overrides).
const fitbit = getFitbitClient(pool);

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

        // Nemesis: close all fully-elapsed days of my matchup (stands in for
        // the M8 midnight cron run — same pattern as bingo detection above)
        const matchup = await pool.query(
          `SELECT id FROM nemesis_matchups
           WHERE week_id = $1 AND (player_a = $2 OR player_b = $2)`,
          [weekId, r.rows[0].id],
        );
        if (matchup.rowCount) {
          await closeElapsedDays(pool, matchup.rows[0].id, date);
        }
      }
    }
    res.json({ ok: true, syncedAt: new Date().toISOString() });
  } catch (e) {
    next(e);
  }
});
