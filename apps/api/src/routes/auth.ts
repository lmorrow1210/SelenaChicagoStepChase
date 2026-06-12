import { createHash, randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { Router } from "express";
import { pool } from "../db/pool.js";
import { decryptToken, encryptToken } from "../lib/crypto.js";
import { clearSessionCookie, setSessionCookie } from "../lib/session.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError, errors } from "../middleware/errors.js";

export const authRouter = Router();

const OAUTH_STATE_COOKIE = "sc_oauth_state";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const DISPLAY_NAME_MAX = 40;
const GOOGLE_HEALTH_SCOPES = [
  "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly",
  "https://www.googleapis.com/auth/googlehealth.sleep.readonly",
  "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly",
] as const;
const GOOGLE_SCOPES = ["openid", "email", "profile", ...GOOGLE_HEALTH_SCOPES];

const devLoginSchema = z.object({
  email: z.string().email(),
  display_name: z.string().min(1).max(DISPLAY_NAME_MAX),
});

function webOrigin(): string {
  return process.env.WEB_ORIGIN ?? "http://localhost:3000";
}

function webRedirect(path: string): string {
  return new URL(path, webOrigin()).toString();
}

function googleConfig(): { clientId: string; clientSecret: string; redirectUri: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApiError(501, "GOOGLE_OAUTH_NOT_CONFIGURED", "Google OAuth is not configured");
  }
  return { clientId, clientSecret, redirectUri };
}

function oauthClient(): OAuth2Client {
  const { clientId, clientSecret, redirectUri } = googleConfig();
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

function queryString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeDisplayName(value: unknown, email: string): string {
  const fallback = email.split("@")[0] || "Player";
  const name = typeof value === "string" && value.trim() ? value.trim() : fallback;
  return name.slice(0, DISPLAY_NAME_MAX);
}

function grantedScopes(scope: string | null | undefined): string[] {
  return scope?.split(" ").filter(Boolean) ?? [];
}

function hasRequiredHealthScopes(scopes: string[]): boolean {
  return GOOGLE_HEALTH_SCOPES.every((scope) => scopes.includes(scope));
}

async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const client = oauthClient();
  await client.revokeToken(refreshToken);
}

authRouter.get("/google", (_req, res, next) => {
  try {
    const client = oauthClient();
    const state = randomBytes(32).toString("base64url");
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: OAUTH_STATE_TTL_MS,
      path: "/api/auth/google",
    });
    res.redirect(
      client.generateAuthUrl({
        access_type: "offline",
        include_granted_scopes: true,
        prompt: "consent",
        response_type: "code",
        scope: GOOGLE_SCOPES,
        state,
      }),
    );
  } catch (e) {
    next(e);
  }
});

authRouter.get("/google/callback", async (req, res, next) => {
  try {
    const error = queryString(req.query.error);
    if (error) {
      res.clearCookie(OAUTH_STATE_COOKIE, { path: "/api/auth/google" });
      res.redirect(webRedirect("/login?error=oauth_denied"));
      return;
    }

    const code = queryString(req.query.code);
    const state = queryString(req.query.state);
    if (!code || !state || state !== req.cookies?.[OAUTH_STATE_COOKIE]) {
      throw errors.validation("Invalid Google OAuth callback");
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/api/auth/google" });

    const client = oauthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw errors.validation("Google did not return an identity token");

    const { clientId } = googleConfig();
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) throw errors.validation("Google profile is incomplete");

    const googleSub = payload.sub;
    const email = payload.email.toLowerCase();
    const displayName = normalizeDisplayName(payload.name, email);
    const scopes = grantedScopes(tokens.scope);
    const healthScopesGranted = hasRequiredHealthScopes(scopes);
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptToken(tokens.refresh_token)
      : null;

    const existing = await pool.query(
      "SELECT id, fitbit_refresh_token_enc FROM users WHERE google_sub = $1",
      [googleSub],
    );
    const isNewUser = !existing.rowCount;
    const hasStoredRefreshToken = Boolean(existing.rows[0]?.fitbit_refresh_token_enc);
    const fitbitConnected =
      healthScopesGranted && Boolean(encryptedRefreshToken || hasStoredRefreshToken);

    const upserted = await pool.query(
      `INSERT INTO users (
         google_sub, email, display_name, fitbit_connected,
         fitbit_refresh_token_enc, fitbit_scopes
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (google_sub) DO UPDATE SET
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name,
         fitbit_connected = EXCLUDED.fitbit_connected,
         fitbit_refresh_token_enc = COALESCE(EXCLUDED.fitbit_refresh_token_enc, users.fitbit_refresh_token_enc),
         fitbit_scopes = EXCLUDED.fitbit_scopes
       RETURNING id`,
      [googleSub, email, displayName, fitbitConnected, encryptedRefreshToken, scopes],
    );

    setSessionCookie(res, { user_id: upserted.rows[0].id });
    res.redirect(webRedirect(isNewUser ? "/onboarding" : "/map"));
  } catch (e) {
    next(e);
  }
});

authRouter.post("/dev-login", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") throw errors.notFound("Not found");

    const body = devLoginSchema.parse(req.body);
    const email = body.email.toLowerCase();
    const googleSub = `dev:${createHash("sha256").update(email).digest("hex")}`;
    const upserted = await pool.query(
      `INSERT INTO users (google_sub, email, display_name, fitbit_connected)
       VALUES ($1, $2, $3, FALSE)
       ON CONFLICT (google_sub) DO UPDATE SET
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name
       RETURNING id, email, display_name, group_id, weekly_step_target,
                 avatar_skin, avatar_hair, avatar_colorway,
                 fitbit_connected, last_synced_at`,
      [googleSub, email, body.display_name],
    );
    setSessionCookie(res, { user_id: upserted.rows[0].id });
    res.status(201).json({ user: upserted.rows[0] });
  } catch (e) {
    next(e);
  }
});

authRouter.delete("/fitbit", requireAuth, async (req, res, next) => {
  try {
    const user = await pool.query(
      "SELECT fitbit_refresh_token_enc FROM users WHERE id = $1",
      [req.userId],
    );
    if (!user.rowCount) throw errors.unauthenticated();
    const encrypted = user.rows[0].fitbit_refresh_token_enc as Buffer | null;

    if (encrypted) {
      try {
        await revokeRefreshToken(decryptToken(encrypted));
      } catch {
        // Keep disconnect reliable even when Google's revoke endpoint is unavailable.
      }
    }

    await pool.query(
      `UPDATE users
       SET fitbit_connected = FALSE,
           fitbit_refresh_token_enc = NULL,
           fitbit_scopes = NULL
       WHERE id = $1`,
      [req.userId],
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
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
