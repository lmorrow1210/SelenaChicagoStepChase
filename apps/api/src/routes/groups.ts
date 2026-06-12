import { Router } from "express";
import { createGroupSchema, joinGroupSchema, GROUP_MAX_MEMBERS } from "@selenas-chase/shared";
import { pool } from "../db/pool.js";
import { generateInviteCode } from "../lib/inviteCode.js";
import { createFirstWeek } from "../services/week.js";
import { requireAuth } from "../middleware/auth.js";
import { errors } from "../middleware/errors.js";

export const groupsRouter = Router();
groupsRouter.use(requireAuth);

const MEMBER_FIELDS =
  "id, display_name, avatar_skin, avatar_hair, avatar_colorway, weekly_step_target";

async function memberCount(groupId: string): Promise<number> {
  const r = await pool.query("SELECT count(*)::int AS n FROM users WHERE group_id = $1", [groupId]);
  return r.rows[0].n;
}

groupsRouter.post("/", async (req, res, next) => {
  try {
    const { name } = createGroupSchema.parse(req.body);
    const me = await pool.query("SELECT group_id FROM users WHERE id = $1", [req.userId]);
    if (!me.rowCount) throw errors.unauthenticated();
    if (me.rows[0].group_id) throw errors.conflict("ALREADY_IN_GROUP", "You're already in a group");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // retry on the rare invite-code collision
      let group;
      for (let attempt = 0; ; attempt++) {
        try {
          group = await client.query(
            "INSERT INTO groups (name, invite_code, admin_id) VALUES ($1, $2, $3) RETURNING *",
            [name, generateInviteCode(), req.userId],
          );
          break;
        } catch (e: any) {
          if (e.code === "23505" && attempt < 5) continue;
          throw e;
        }
      }
      await client.query("UPDATE users SET group_id = $1 WHERE id = $2", [
        group.rows[0].id,
        req.userId,
      ]);
      // first week starts immediately: city #1, target = Σ member targets
      await createFirstWeek(client, group.rows[0].id, group.rows[0].timezone);
      await client.query("COMMIT");
      res.status(201).json({ group: group.rows[0] });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    next(e);
  }
});

groupsRouter.post("/join", async (req, res, next) => {
  try {
    const { invite_code } = joinGroupSchema.parse(req.body);
    const me = await pool.query("SELECT group_id FROM users WHERE id = $1", [req.userId]);
    if (me.rows[0]?.group_id) throw errors.conflict("ALREADY_IN_GROUP", "You're already in a group");

    const group = await pool.query("SELECT * FROM groups WHERE invite_code = $1", [invite_code]);
    if (!group.rowCount) throw errors.notFound("No group with that code");
    if ((await memberCount(group.rows[0].id)) >= GROUP_MAX_MEMBERS) {
      throw errors.conflict("GROUP_FULL", "This group already has 8 players");
    }
    await pool.query("UPDATE users SET group_id = $1 WHERE id = $2", [
      group.rows[0].id,
      req.userId,
    ]);
    res.json({ group: group.rows[0] });
  } catch (e) {
    next(e);
  }
});

groupsRouter.get("/me", async (req, res, next) => {
  try {
    const me = await pool.query("SELECT group_id FROM users WHERE id = $1", [req.userId]);
    const groupId = me.rows[0]?.group_id;
    if (!groupId) throw errors.notFound("You're not in a group");
    const [group, members] = await Promise.all([
      pool.query("SELECT * FROM groups WHERE id = $1", [groupId]),
      pool.query(`SELECT ${MEMBER_FIELDS} FROM users WHERE group_id = $1 ORDER BY created_at`, [
        groupId,
      ]),
    ]);
    res.json({ group: group.rows[0], members: members.rows });
  } catch (e) {
    next(e);
  }
});

groupsRouter.post("/me/leave", async (req, res, next) => {
  try {
    const me = await pool.query("SELECT group_id FROM users WHERE id = $1", [req.userId]);
    const groupId = me.rows[0]?.group_id;
    if (!groupId) throw errors.notFound("You're not in a group");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE users SET group_id = NULL WHERE id = $1", [req.userId]);
      const g = await client.query("SELECT admin_id FROM groups WHERE id = $1 FOR UPDATE", [
        groupId,
      ]);
      if (g.rows[0].admin_id === req.userId) {
        // promote oldest remaining member, if any
        const next = await client.query(
          "SELECT id FROM users WHERE group_id = $1 ORDER BY created_at LIMIT 1",
          [groupId],
        );
        await client.query("UPDATE groups SET admin_id = $1 WHERE id = $2", [
          next.rows[0]?.id ?? null,
          groupId,
        ]);
      }
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    next(e);
  }
});
