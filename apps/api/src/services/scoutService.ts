import type { Pool, PoolClient } from "pg";
import { countBingoLines, isBlackout } from "./bingo.js";
import type { BingoTile } from "@one-step-ahead/shared";

/* ============================================================
   M10 Field Ops — the scout-token economy (addendum §5/§6).

   BINGO lines are Scout Tokens. Tokens send a drone ONE CITY
   AHEAD and decrypt that city's recon landmarks (5 per city) as
   a TEAM effort:
     · one landmark unlock per calendar day, max (paced trail)
     · per-player unlock cap so no one solves the trail alone
       (cap 2 for groups ≥3; 3 for pairs; uncapped solo)
     · the player whose line pops a landmark keeps it as a
       personal Intel Card ('confirmed' holo variant when the
       landmark was already in their wallet from a prior visit)
     · tokens beyond the 5 landmarks are overflow → bonus
   ============================================================ */

export interface ScoutState {
  reconCity: { id: number; name: string; country: string } | null;
  teamTokens: number;
  unlockedCount: number;
  overflowBonus: number;
  unlockedToday: boolean;
}

/** The city ONE AHEAD of the week's current city (route wraps). */
export async function getReconCity(
  db: Pool | PoolClient,
  weekId: string,
): Promise<{ id: number; name: string; country: string; route_order: number } | null> {
  const row = await db.query(
    `SELECT next_c.id, next_c.name, next_c.country, next_c.route_order
     FROM weeks w
     JOIN cities cur ON cur.id = w.city_id
     JOIN cities next_c ON next_c.route_order = CASE
       WHEN cur.route_order >= (SELECT MAX(route_order) FROM cities) THEN 1
       ELSE cur.route_order + 1 END
     WHERE w.id = $1`,
    [weekId],
  );
  return row.rowCount ? row.rows[0] : null;
}

function perPlayerCap(groupSize: number): number {
  if (groupSize <= 1) return 5; // solo groups shouldn't brick the trail
  if (groupSize === 2) return 3;
  return 2;
}

interface ScoutSnapshot {
  state: ScoutState;
  groupSize: number;
  unlocked: { landmark_id: number; triggering_user: string | null; unlock_date: string }[];
  nextLandmarkId: number | null;
  reconId: number | null;
}

/** Read-only scout state — safe for GET handlers (never unlocks). */
export async function getScoutState(
  db: Pool | PoolClient,
  weekId: string,
  groupId: string,
  today: string,
): Promise<ScoutSnapshot> {
  const recon = await getReconCity(db, weekId);
  if (!recon) {
    return {
      state: { reconCity: null, teamTokens: 0, unlockedCount: 0, overflowBonus: 0, unlockedToday: false },
      groupSize: 0,
      unlocked: [],
      nextLandmarkId: null,
      reconId: null,
    };
  }

  // Team tokens = sum of every member's bingo lines this week.
  const tokensRow = await db.query(
    `SELECT COALESCE(SUM(bc.bingo_lines), 0)::int AS tokens,
            COUNT(DISTINCT u.id)::int AS group_size
     FROM users u
     LEFT JOIN bingo_cards bc ON bc.user_id = u.id AND bc.week_id = $2
     WHERE u.group_id = $1`,
    [groupId, weekId],
  );
  const teamTokens = Number(tokensRow.rows[0].tokens);
  const groupSize = Number(tokensRow.rows[0].group_size);

  const unlocksRow = await db.query(
    `SELECT l.id AS landmark_id, cu.unlocked, cu.unlock_date, cu.triggering_user
     FROM landmarks l
     LEFT JOIN city_unlocks cu ON cu.landmark_id = l.id AND cu.week_id = $2
     WHERE l.city_id = $1
     ORDER BY l.day ASC`,
    [recon.id, weekId],
  );
  const unlocked = unlocksRow.rows.filter((r) => r.unlocked);
  const next = unlocksRow.rows.find((r) => !r.unlocked);

  return {
    state: {
      reconCity: { id: recon.id, name: recon.name, country: recon.country },
      teamTokens,
      unlockedCount: unlocked.length,
      overflowBonus: Math.max(0, teamTokens - 5),
      unlockedToday: unlocked.some((r) => String(r.unlock_date) === today),
    },
    groupSize,
    unlocked,
    nextLandmarkId: next ? next.landmark_id : null,
    reconId: recon.id,
  };
}

/**
 * Advance the team trail after a player's card changed. Idempotent —
 * computes team tokens from all cards and unlocks at most one landmark
 * (today, respecting the per-player cap). The unlocking player gets the
 * Intel Card. Returns the current scout state for the group's week.
 */
export async function processScoutTokens(
  db: Pool | PoolClient,
  weekId: string,
  groupId: string,
  triggeringUserId: string | null,
  today: string,
): Promise<ScoutState> {
  const snapshot = await getScoutState(db, weekId, groupId, today);
  const { state, groupSize, unlocked } = snapshot;
  if (!snapshot.reconId) return state;
  const { teamTokens, unlockedCount } = state;

  // Nothing more to unlock, no spare tokens, or already unlocked today.
  if (unlockedCount >= 5 || teamTokens <= unlockedCount || state.unlockedToday) return state;

  // Per-player cap: the triggering player can't be credited past the cap.
  if (triggeringUserId) {
    const mine = unlocked.filter((r) => r.triggering_user === triggeringUserId).length;
    if (mine >= perPlayerCap(groupSize)) return state;
  }

  if (snapshot.nextLandmarkId == null) return state;
  const nextLandmarkId = snapshot.nextLandmarkId;

  await db.query(
    `INSERT INTO city_unlocks (week_id, landmark_id, unlock_date, unlocked, unlocked_at, triggering_user)
     VALUES ($1, $2, $3::date, TRUE, now(), $4)
     ON CONFLICT (week_id, landmark_id) DO UPDATE SET
       unlocked = TRUE,
       unlocked_at = COALESCE(city_unlocks.unlocked_at, EXCLUDED.unlocked_at),
       triggering_user = COALESCE(city_unlocks.triggering_user, EXCLUDED.triggering_user)`,
    [weekId, nextLandmarkId, today, triggeringUserId],
  );

  // Intel Card for the scout — CONFIRMED holo if it's a revisit.
  if (triggeringUserId) {
    const prior = await db.query(
      `SELECT 1 FROM intel_cards WHERE user_id = $1 AND landmark_id = $2 AND week_id <> $3 LIMIT 1`,
      [triggeringUserId, nextLandmarkId, weekId],
    );
    await db.query(
      `INSERT INTO intel_cards (user_id, landmark_id, city_id, week_id, variant)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, landmark_id, week_id) DO NOTHING`,
      [triggeringUserId, nextLandmarkId, snapshot.reconId, weekId, prior.rowCount ? "confirmed" : "scouted"],
    );
  }

  return {
    ...state,
    unlockedCount: unlockedCount + 1,
    unlockedToday: true,
  };
}

/** Honor-system completion: self-report a tile whose source is 'honor'. */
export async function honorComplete(
  db: Pool | PoolClient,
  weekId: string,
  groupId: string,
  userId: string,
  challengeId: number,
  today: string,
  note?: string,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const def = await db.query(
    `SELECT source FROM bingo_challenge_definitions WHERE id = $1`,
    [challengeId],
  );
  if (!def.rowCount) return { ok: false, code: "UNKNOWN_CHALLENGE", message: "No such objective." };
  if (def.rows[0].source !== "honor") {
    return { ok: false, code: "NOT_HONOR", message: "That objective is auto-tracked by your wearable." };
  }

  const cardRow = await db.query(
    `SELECT id, tiles, frozen FROM bingo_cards WHERE week_id = $1 AND user_id = $2`,
    [weekId, userId],
  );
  if (!cardRow.rowCount) return { ok: false, code: "NO_CARD", message: "No card this week." };
  if (cardRow.rows[0].frozen) return { ok: false, code: "FROZEN", message: "Card is frozen." };

  const tiles: BingoTile[] = cardRow.rows[0].tiles;
  const idx = tiles.findIndex((t) => "challenge_id" in t && t.challenge_id === challengeId);
  if (idx === -1) return { ok: false, code: "NOT_ON_CARD", message: "That objective isn't on your card." };
  const tile = tiles[idx] as Extract<BingoTile, { challenge_id: number }>;
  if (tile.state === "complete") return { ok: false, code: "ALREADY_DONE", message: "Already complete." };

  tiles[idx] = {
    ...tile,
    state: "complete",
    completed_at: new Date().toISOString(),
    honor: true,
    honor_note: note ?? null,
  };

  await db.query(
    `UPDATE bingo_cards SET tiles = $1, bingo_lines = $2, blackout = $3 WHERE id = $4`,
    [JSON.stringify(tiles), countBingoLines(tiles), isBlackout(tiles), cardRow.rows[0].id],
  );
  await processScoutTokens(db, weekId, groupId, userId, today);
  return { ok: true };
}

/** Gift-a-Tile: cover a tile you've completed for a teammate (2/week). */
export async function giftTile(
  db: Pool | PoolClient,
  weekId: string,
  groupId: string,
  fromUser: string,
  toUser: string,
  challengeId: number,
  today: string,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  if (fromUser === toUser) {
    return { ok: false, code: "SELF_GIFT", message: "You can't cover your own tile." };
  }
  const teammate = await db.query(`SELECT 1 FROM users WHERE id = $1 AND group_id = $2`, [toUser, groupId]);
  if (!teammate.rowCount) return { ok: false, code: "NOT_TEAMMATE", message: "Not on your squad." };

  const spent = await db.query(
    `SELECT COUNT(*)::int AS n FROM tile_gifts WHERE week_id = $1 AND from_user = $2`,
    [weekId, fromUser],
  );
  if (Number(spent.rows[0].n) >= 2) {
    return { ok: false, code: "ASSISTS_SPENT", message: "Both assists used this week." };
  }

  // You may only gift a tile you've completed yourself.
  const giverCard = await db.query(
    `SELECT tiles FROM bingo_cards WHERE week_id = $1 AND user_id = $2`,
    [weekId, fromUser],
  );
  const giverTiles: BingoTile[] = giverCard.rows[0]?.tiles ?? [];
  const giverDone = giverTiles.some(
    (t) => "challenge_id" in t && t.challenge_id === challengeId && t.state === "complete",
  );
  if (!giverDone) {
    return { ok: false, code: "NOT_COMPLETED", message: "Complete that tile yourself before covering it." };
  }

  const recipCard = await db.query(
    `SELECT id, tiles, frozen FROM bingo_cards WHERE week_id = $1 AND user_id = $2`,
    [weekId, toUser],
  );
  if (!recipCard.rowCount) return { ok: false, code: "NO_CARD", message: "Teammate has no card yet." };
  if (recipCard.rows[0].frozen) return { ok: false, code: "FROZEN", message: "Their card is frozen." };

  const tiles: BingoTile[] = recipCard.rows[0].tiles;
  const idx = tiles.findIndex((t) => "challenge_id" in t && t.challenge_id === challengeId);
  if (idx === -1) return { ok: false, code: "NOT_ON_CARD", message: "That tile isn't on their card." };
  const tile = tiles[idx] as Extract<BingoTile, { challenge_id: number }>;
  if (tile.state === "complete") return { ok: false, code: "ALREADY_DONE", message: "Already complete." };

  await db.query(
    `INSERT INTO tile_gifts (week_id, from_user, to_user, challenge_id) VALUES ($1, $2, $3, $4)`,
    [weekId, fromUser, toUser, challengeId],
  );

  tiles[idx] = { ...tile, state: "complete", completed_at: new Date().toISOString(), gifted_by: fromUser };
  await db.query(
    `UPDATE bingo_cards SET tiles = $1, bingo_lines = $2, blackout = $3 WHERE id = $4`,
    [JSON.stringify(tiles), countBingoLines(tiles), isBlackout(tiles), recipCard.rows[0].id],
  );
  // The recipient is the scout if this pops a landmark.
  await processScoutTokens(db, weekId, groupId, toUser, today);
  return { ok: true };
}
