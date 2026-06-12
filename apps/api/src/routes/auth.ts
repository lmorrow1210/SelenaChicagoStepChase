import { Router } from "express";
import { pool } from "../db/pool.js";
import { clearSessionCookie } from "../lib/session.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// TODO(M1): GET /google and GET /google/callback — Google OAuth code exchange,
// id_token verify, user upsert by google_sub, refresh-token encryption via
// lib/crypto.encryptToken, then setSessionCookie + redirect. Blocked on
// GOOGLE_CLIENT_ID/SECRET and Health API base verification (plan §5).
authRouter.get("/google", (_req, res) => {
  res.status(501).json({
    error: { code: "NOT_IMPLEMENTED", message: "Google OAuth pending credentials (M1)" },
  });
});

authRouter.get("/session", requireAuth, async (req, res, next) => {
  try {
    const user = await pool.query(
      `SELECT id, email, display_name, group_id, weekly_step_target,
              avatar_skin, avatar_hair, avatar_colorway,
              fitbit_connected, last_synced_at
       FROM users WHERE id = $1`,
      [req.userId],
    );
    if (!user.rowCount) {
      clearSessionCookie(res);
      res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required" } });
      return;
    }
    const groupId = user.rows[0].group_id;
    const [group, activeWeek] = await Promise.all([
      groupId
        ? pool.query("SELECT id, name, invite_code, admin_id, timezone FROM groups WHERE id = $1", [groupId])
        : null,
      groupId
        ? pool.query("SELECT * FROM weeks WHERE group_id = $1 AND status = 'active'", [groupId])
        : null,
    ]);
    res.json({
      user: user.rows[0],
      group: group?.rows[0] ?? null,
      activeWeek: activeWeek?.rows[0] ?? null,
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/logout", requireAuth, (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});
