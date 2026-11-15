import type { Pool } from "pg";
import { reassignNemesisOnDeparture } from "./nemesisService.js";

// Permanent account deletion ("delete my data"). One transaction; nothing is
// removed unless everything is. PII rule: log ids only.
//
// What goes: the user row and, by ON DELETE CASCADE, everything keyed to it —
// step/sleep/workout logs, the encrypted Google refresh token, predictions,
// bingo cards, badges, notifications, ritual views, tile gifts, beat events,
// field-ops records, and every nemesis matchup the player was in.
//
// What stays (group history, no personal data): closed weeks keep their
// stored group totals and outcome; landmarks the group unlocked stay
// unlocked (the "who triggered it" pointer is cleared); evidence stays.
//
// Known consequence: a former opponent loses the matchup row for weeks they
// played against the deleted player. Their badges are untouched.

export interface AccountDeletionResult {
  deleted: boolean;
  /** The encrypted refresh token as stored, for a best-effort revoke AFTER commit. */
  refreshTokenEnc: Buffer | null;
}

export async function deleteAccount(pool: Pool, userId: string): Promise<AccountDeletionResult> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const me = await client.query(
      `SELECT group_id, fitbit_refresh_token_enc FROM users WHERE id = $1 FOR UPDATE`,
      [userId],
    );
    if (!me.rowCount) {
      await client.query("ROLLBACK");
      return { deleted: false, refreshTokenEnc: null };
    }
    const groupId = me.rows[0].group_id as string | null;
    const refreshTokenEnc = (me.rows[0].fitbit_refresh_token_enc as Buffer | null) ?? null;

    if (groupId) {
      // Same hand-off as "leave": the opponent in any open week re-pairs with
      // the bye (or becomes it), and the admin role passes to the oldest
      // remaining member.
      const open = await client.query(
        `SELECT id FROM weeks WHERE group_id = $1 AND status IN ('active', 'scheduled')
         ORDER BY starts_on ASC`,
        [groupId],
      );
      for (const week of open.rows) {
        await reassignNemesisOnDeparture(client, week.id as string, userId);
      }
      const g = await client.query(`SELECT admin_id FROM groups WHERE id = $1 FOR UPDATE`, [groupId]);
      if (g.rows[0]?.admin_id === userId) {
        const next = await client.query(
          `SELECT id FROM users WHERE group_id = $1 AND id <> $2 ORDER BY created_at LIMIT 1`,
          [groupId, userId],
        );
        await client.query(`UPDATE groups SET admin_id = $1 WHERE id = $2`, [
          next.rows[0]?.id ?? null,
          groupId,
        ]);
      }
    }

    // The only reference to users without ON DELETE CASCADE / SET NULL that
    // survives the cascade: the group's landmark unlock keeps existing, minus
    // the pointer to who triggered it.
    await client.query(`UPDATE city_unlocks SET triggering_user = NULL WHERE triggering_user = $1`, [
      userId,
    ]);

    await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await client.query("COMMIT");
    return { deleted: true, refreshTokenEnc };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
