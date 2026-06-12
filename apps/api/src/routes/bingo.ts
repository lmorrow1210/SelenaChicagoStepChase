import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";
import { createOrGetBingoCard } from "../services/bingoService.js";
import type { BingoTile } from "@selenas-chase/shared";

export const bingoRouter = Router();
bingoRouter.use(requireAuth);

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
    `SELECT id FROM weeks WHERE group_id = $1 AND status = 'active'
     ORDER BY starts_on DESC LIMIT 1`,
    [groupId],
  );
  if (!week.rowCount) throw errors.notFound("No active week");

  return { groupId, weekId: week.rows[0].id as string };
}

bingoRouter.get("/current", async (req, res, next) => {
  try {
    const { groupId, weekId } = await currentWeekAndGroup(req.userId!);

    // Ensure card exists; create lazily if not yet generated
    const card = await createOrGetBingoCard(pool, weekId, req.userId!);

    // Enrich tile data with challenge labels and icons
    const tiles: BingoTile[] = card.tiles;
    const challengeIds = tiles
      .filter((t): t is Extract<BingoTile, { challenge_id: number }> => "challenge_id" in t)
      .map((t) => t.challenge_id);

    const challengeRows = await pool.query(
      `SELECT id, label, icon FROM bingo_challenge_definitions WHERE id = ANY($1)`,
      [challengeIds],
    );
    const challengeMeta = new Map(
      challengeRows.rows.map((r) => [Number(r.id), { label: r.label, icon: r.icon }]),
    );

    const enrichedTiles = tiles.map((tile) => {
      if ("free" in tile) return { ...tile, label: "FREE", icon: "star" };
      const meta = challengeMeta.get(tile.challenge_id);
      return { ...tile, label: meta?.label ?? "", icon: meta?.icon ?? "step" };
    });

    // Friends progress (same group, same week)
    const friends = await pool.query(
      `SELECT u.id, u.display_name, u.avatar_skin, u.avatar_hair, u.avatar_colorway,
              COALESCE(bc.bingo_lines, 0)::int AS bingo_lines,
              COALESCE(bc.blackout, FALSE) AS blackout
       FROM users u
       LEFT JOIN bingo_cards bc ON bc.user_id = u.id AND bc.week_id = $1
       WHERE u.group_id = $2 AND u.id != $3
       ORDER BY COALESCE(bc.bingo_lines, 0) DESC, u.display_name`,
      [weekId, groupId, req.userId],
    );

    res.json({
      card: {
        id: card.id,
        tiles: enrichedTiles,
        bingo_lines: card.bingo_lines,
        blackout: card.blackout,
        frozen: card.frozen,
      },
      friends: friends.rows,
    });
  } catch (e) {
    next(e);
  }
});

bingoRouter.get("/friends", async (req, res, next) => {
  try {
    const { groupId, weekId } = await currentWeekAndGroup(req.userId!);

    const rows = await pool.query(
      `SELECT u.id, u.display_name, u.avatar_skin, u.avatar_hair, u.avatar_colorway,
              COALESCE(bc.bingo_lines, 0)::int AS bingo_lines,
              COALESCE(bc.blackout, FALSE) AS blackout
       FROM users u
       LEFT JOIN bingo_cards bc ON bc.user_id = u.id AND bc.week_id = $1
       WHERE u.group_id = $2
       ORDER BY COALESCE(bc.bingo_lines, 0) DESC, u.display_name`,
      [weekId, groupId],
    );

    res.json({ friends: rows.rows });
  } catch (e) {
    next(e);
  }
});
