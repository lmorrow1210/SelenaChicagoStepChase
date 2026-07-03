import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { createOrGetBingoCard } from "../services/bingoService.js";
import { getScoutState, honorComplete, giftTile } from "../services/scoutService.js";
import { honorCompleteSchema, giftTileSchema, type BingoTile } from "@one-step-ahead/shared";

/* ============================================================
   M10 Field Ops (addendum §1) — one screen, two linked panels:
   the Ops Board (bingo matrix, the cause) and the Trail (recon
   landmark dossiers for the city ONE AHEAD, the effect).
   ============================================================ */

export const fieldopsRouter = Router();
fieldopsRouter.use(requireAuth);

async function currentWeekAndGroup(userId: string) {
  const me = await pool.query(
    `SELECT u.group_id, g.timezone
     FROM users u LEFT JOIN groups g ON g.id = u.group_id
     WHERE u.id = $1`,
    [userId],
  );
  if (!me.rowCount) throw errors.unauthenticated();
  const groupId = me.rows[0].group_id as string | null;
  if (!groupId) throw errors.notFound("You're not in a group");

  const week = await pool.query(
    `SELECT id, to_char(now() AT TIME ZONE COALESCE(g.timezone, 'America/Chicago'), 'YYYY-MM-DD') AS today
     FROM weeks w
     JOIN groups g ON g.id = w.group_id
     WHERE w.group_id = $1 AND w.status = 'active'
     ORDER BY w.starts_on DESC LIMIT 1`,
    [groupId],
  );
  if (!week.rowCount) throw errors.notFound("No active week");

  return { groupId, weekId: week.rows[0].id as string, today: week.rows[0].today as string };
}

/** Merged Field Ops payload: ops board + recon trail + scout state. */
fieldopsRouter.get("/", async (req, res, next) => {
  try {
    const { groupId, weekId, today } = await currentWeekAndGroup(req.userId!);

    const card = await createOrGetBingoCard(pool, weekId, req.userId!);

    // Enrich tiles with label/icon/category/source.
    const tiles: BingoTile[] = card.tiles;
    const challengeIds = tiles
      .filter((t): t is Extract<BingoTile, { challenge_id: number }> => "challenge_id" in t)
      .map((t) => t.challenge_id);
    const meta = await pool.query(
      `SELECT id, label, icon, category, source FROM bingo_challenge_definitions WHERE id = ANY($1)`,
      [challengeIds],
    );
    const metaById = new Map(meta.rows.map((r) => [Number(r.id), r]));
    const enrichedTiles = tiles.map((tile) => {
      if ("free" in tile) {
        return { ...tile, label: "FREE", icon: "star", category: "wildcard", source: "auto" };
      }
      const m = metaById.get(tile.challenge_id);
      return {
        ...tile,
        label: m?.label ?? "",
        icon: m?.icon ?? "step",
        category: m?.category ?? "steps",
        source: m?.source ?? "auto",
      };
    });

    // Scout state + recon trail — strictly read-only (unlocks only happen
    // in the sync/honor/gift paths where a scout gets credited).
    const snapshot = await getScoutState(pool, weekId, groupId, today);
    const scout = snapshot.state;
    const trail = snapshot.reconId
      ? (
          await pool.query(
            `SELECT l.id, l.day, l.name, l.fun_fact,
                    COALESCE(cu.unlocked, FALSE) AS unlocked,
                    to_char(cu.unlock_date, 'YYYY-MM-DD') AS unlock_date,
                    u.display_name AS scouted_by
             FROM landmarks l
             LEFT JOIN city_unlocks cu ON cu.landmark_id = l.id AND cu.week_id = $2
             LEFT JOIN users u ON u.id = cu.triggering_user
             WHERE l.city_id = $1
             ORDER BY l.day ASC`,
            [snapshot.reconId, weekId],
          )
        ).rows
      : [];

    // Assists remaining + teammates for the gift picker.
    const spent = await pool.query(
      `SELECT COUNT(*)::int AS n FROM tile_gifts WHERE week_id = $1 AND from_user = $2`,
      [weekId, req.userId],
    );
    const teammates = await pool.query(
      `SELECT u.id, u.display_name, u.avatar_skin, u.avatar_hair, u.avatar_colorway,
              COALESCE(bc.bingo_lines, 0)::int AS bingo_lines,
              COALESCE(bc.blackout, FALSE) AS blackout
       FROM users u
       LEFT JOIN bingo_cards bc ON bc.user_id = u.id AND bc.week_id = $2
       WHERE u.group_id = $1 AND u.id <> $3
       ORDER BY u.display_name`,
      [groupId, weekId, req.userId],
    );

    res.json({
      card: {
        id: card.id,
        tiles: enrichedTiles,
        bingo_lines: card.bingo_lines,
        blackout: card.blackout,
        frozen: card.frozen,
      },
      scout,
      reconCity: scout.reconCity,
      trail,
      assists: { remaining: Math.max(0, 2 - Number(spent.rows[0].n)) },
      teammates: teammates.rows,
    });
  } catch (e) {
    next(e);
  }
});

/** Self-report an honor-system tile (addendum §3). */
fieldopsRouter.post("/honor", async (req, res, next) => {
  try {
    const body = honorCompleteSchema.safeParse(req.body);
    if (!body.success) throw errors.validation("challenge_id required");
    const { groupId, weekId, today } = await currentWeekAndGroup(req.userId!);
    const result = await honorComplete(
      pool, weekId, groupId, req.userId!, body.data.challenge_id, today, body.data.note,
    );
    if (!result.ok) {
      res.status(409).json({ error: { code: result.code, message: result.message } });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/** Cover a completed tile for a teammate (addendum §7B). */
fieldopsRouter.post("/gift", async (req, res, next) => {
  try {
    const body = giftTileSchema.safeParse(req.body);
    if (!body.success) throw errors.validation("to_user_id and challenge_id required");
    const { groupId, weekId, today } = await currentWeekAndGroup(req.userId!);
    const result = await giftTile(
      pool, weekId, groupId, req.userId!, body.data.to_user_id, body.data.challenge_id, today,
    );
    if (!result.ok) {
      res.status(409).json({ error: { code: result.code, message: result.message } });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/** Personal Intel Wallet — season-long case-file collection (§7A). */
fieldopsRouter.get("/wallet", async (req, res, next) => {
  try {
    const cards = await pool.query(
      `SELECT ic.id, ic.variant, ic.created_at,
              l.name AS landmark_name, l.fun_fact,
              c.id AS city_id, c.name AS city_name
       FROM intel_cards ic
       JOIN landmarks l ON l.id = ic.landmark_id
       JOIN cities c ON c.id = ic.city_id
       WHERE ic.user_id = $1
       ORDER BY ic.created_at DESC`,
      [req.userId],
    );
    res.json({ cards: cards.rows });
  } catch (e) {
    next(e);
  }
});
