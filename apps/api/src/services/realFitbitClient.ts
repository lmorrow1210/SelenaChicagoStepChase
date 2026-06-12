import { OAuth2Client } from "google-auth-library";
import type { Pool } from "pg";
import { decryptToken } from "../lib/crypto.js";
import { withBackoff } from "../lib/backoff.js";
import type { DayMetrics, FitbitClient, Workout } from "./fitbitClient.js";

// The real Google Health API client (plan §5). This file is the ONLY place
// that talks to the live API. PII rule: never log step values, tokens, email.
//
// ⚠ VERIFY AT INTEGRATION TIME (plan §5 flag): the spec names
// `health.googleapis.com/v4` as the base. Confirm the current endpoint base,
// resource paths, and response shapes against Google's docs with the sandbox
// account before first production sync. Paths below mirror the Fitbit Web API
// resource layout under the spec's base and parse defensively — adjusting
// them is a this-file-only change.

const API_BASE = process.env.HEALTH_API_BASE ?? "https://health.googleapis.com/v4";

/** Refresh token rejected — user must reconnect. Cron flips fitbit_connected. */
export class InvalidGrantError extends Error {
  constructor(public userId: string) {
    super("Health API refresh token is no longer valid");
  }
}

/** User has no stored refresh token; skip them (not an error). */
export class NotConnectedError extends Error {
  constructor(public userId: string) {
    super("User has no Health API connection");
  }
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

function asNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

export class RealFitbitClient implements FitbitClient {
  /** Access tokens live in-process only (plan §5) — never persisted. */
  private accessTokens = new Map<string, CachedToken>();

  constructor(
    private pool: Pool,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  private oauth(): OAuth2Client {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are required for real sync");
    }
    return new OAuth2Client(clientId, clientSecret);
  }

  private async accessToken(userId: string): Promise<string> {
    const cached = this.accessTokens.get(userId);
    if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

    const r = await this.pool.query(
      `SELECT fitbit_refresh_token_enc FROM users WHERE id = $1 AND fitbit_connected`,
      [userId],
    );
    const enc = r.rows[0]?.fitbit_refresh_token_enc as Buffer | null | undefined;
    if (!enc) throw new NotConnectedError(userId);

    const client = this.oauth();
    client.setCredentials({ refresh_token: decryptToken(enc) });
    try {
      const { token, res } = await client.getAccessToken();
      if (!token) throw new InvalidGrantError(userId);
      const expiresAt =
        asNumber((res?.data as { expires_in?: number } | undefined)?.expires_in) ?? 3000;
      this.accessTokens.set(userId, { token, expiresAt: Date.now() + expiresAt * 1000 });
      return token;
    } catch (err) {
      if (err instanceof InvalidGrantError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("invalid_grant")) {
        this.accessTokens.delete(userId);
        throw new InvalidGrantError(userId);
      }
      throw err;
    }
  }

  private async get(
    userId: string,
    path: string,
    retried = false,
  ): Promise<Record<string, unknown>> {
    const token = await this.accessToken(userId);
    try {
      return await withBackoff(async () => {
        const res = await this.fetchImpl(`${API_BASE}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new HttpError(res.status, `Health API ${res.status} on ${path}`);
        return (await res.json()) as Record<string, unknown>;
      });
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        // expired access token: refresh and retry once; a second 401 means
        // access was revoked
        this.accessTokens.delete(userId);
        if (!retried) return this.get(userId, path, true);
        throw new InvalidGrantError(userId);
      }
      throw err;
    }
  }

  /**
   * Pull one user's day. Steps are required (failure throws so the run can
   * retry next tick); sleep/heart pulls are independent — failures leave
   * those fields null and the rest of the day still lands (plan §5 partial
   * sync).
   */
  async fetchDay(userId: string, date: string): Promise<DayMetrics> {
    const activity = await this.get(userId, `/users/me/activities/date/${date}`);
    const summary = (activity.summary ?? {}) as Record<string, unknown>;
    const steps = asNumber(summary.steps) ?? asNumber(activity.steps) ?? 0;
    const azm =
      asNumber(summary.activeZoneMinutes) ??
      asNumber((summary.activeZoneMinutes as Record<string, unknown> | undefined)?.totalMinutes) ??
      null;

    const rawActivities = Array.isArray(activity.activities) ? activity.activities : [];
    const workouts: Workout[] = rawActivities.flatMap((a) => {
      const act = a as Record<string, unknown>;
      const start = typeof act.startTime === "string" ? act.startTime : null;
      const duration = asNumber(act.durationMinutes) ?? asNumber(act.duration);
      if (!start || duration === null) return [];
      return [
        {
          type: typeof act.activityName === "string" ? act.activityName : "workout",
          start,
          duration_min: duration,
          zone_min: asNumber(act.activeZoneMinutes) ?? 0,
        },
      ];
    });

    let sleep_minutes: number | null = null;
    let bedtime: string | null = null;
    try {
      const sleep = await this.get(userId, `/users/me/sleep/date/${date}`);
      const sleepSummary = (sleep.summary ?? {}) as Record<string, unknown>;
      sleep_minutes = asNumber(sleepSummary.totalMinutesAsleep);
      const sessions = Array.isArray(sleep.sleep) ? sleep.sleep : [];
      const main = sessions[0] as Record<string, unknown> | undefined;
      bedtime = typeof main?.startTime === "string" ? main.startTime : null;
    } catch (err) {
      if (err instanceof InvalidGrantError) throw err;
      // partial sync: missing sleep is fine
    }

    let hr_zones: Record<string, number> | null = null;
    try {
      const heart = await this.get(userId, `/users/me/heart/date/${date}`);
      const zones = ((heart.summary as Record<string, unknown> | undefined)?.heartRateZones ??
        heart.heartRateZones) as unknown;
      if (Array.isArray(zones)) {
        hr_zones = {};
        for (const z of zones) {
          const zone = z as Record<string, unknown>;
          const name = typeof zone.name === "string" ? zone.name : null;
          const minutes = asNumber(zone.minutes);
          if (name && minutes !== null) {
            hr_zones[name.toLowerCase().replace(/\s+/g, "_")] = minutes;
          }
        }
      }
    } catch (err) {
      if (err instanceof InvalidGrantError) throw err;
      // partial sync: missing heart data is fine
    }

    return { steps, workouts, sleep_minutes, bedtime, active_zone_minutes: azm, hr_zones };
  }
}
