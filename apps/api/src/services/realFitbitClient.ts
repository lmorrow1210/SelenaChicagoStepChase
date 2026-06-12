import { OAuth2Client } from "google-auth-library";
import type { Pool } from "pg";
import { decryptToken } from "../lib/crypto.js";
import { withBackoff } from "../lib/backoff.js";
import type { DayMetrics, FitbitClient, Workout } from "./fitbitClient.js";

// The real Google Health API client (plan §5). This file is the ONLY place
// that talks to the live API. PII rule: never log step values, tokens, email.
//
// Verified against Google's docs (June 2026): the Health API launched at
// I/O May 2026 at https://health.googleapis.com/v4 and replaces the Fitbit
// Web API (legacy decommission September 2026). Everything lives under one
// resource template, users/me/dataTypes/{dataType}/dataPoints —
//   • daily aggregates: POST …/dataPoints:dailyRollUp with a CivilTimeInterval
//     range (steps → value.steps.countSum, active-zone-minutes → per-zone sums)
//   • sessions: GET …/dataPoints with a civil-time filter (exercise, sleep)
// Refs: developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints
// and …/dataPoints/dailyRollUp.
//
// ⚠ Still pending before first production sync: a live smoke test with the
// sandbox account (union-field casing on rollup values is parsed defensively
// below since the docs show proto field names). Until then run
// HEALTH_API_MODE=mock in production.

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

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/** civil date object for CivilDateTime ({date:{year,month,day}}). */
function civilDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function nextDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Pull a field off a rollup/data point tolerating both proto (snake_case)
 * and REST-JSON (camelCase) names — the docs show proto names and the live
 * casing is unconfirmed until the sandbox smoke test.
 */
function field(obj: Record<string, unknown>, camel: string): unknown {
  if (camel in obj) return obj[camel];
  const snake = camel.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
  return obj[snake];
}

function minutesBetween(startIso: unknown, endIso: unknown): number | null {
  if (typeof startIso !== "string" || typeof endIso !== "string") return null;
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Number.isFinite(ms) && ms >= 0 ? Math.round(ms / 60_000) : null;
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

  private async request(
    userId: string,
    path: string,
    body?: unknown,
    retried = false,
  ): Promise<Record<string, unknown>> {
    const token = await this.accessToken(userId);
    try {
      return await withBackoff(async () => {
        const res = await this.fetchImpl(`${API_BASE}${path}`, {
          method: body === undefined ? "GET" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (!res.ok) throw new HttpError(res.status, `Health API ${res.status} on ${path}`);
        return (await res.json()) as Record<string, unknown>;
      });
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        // expired access token: refresh and retry once; a second 401 means
        // access was revoked
        this.accessTokens.delete(userId);
        if (!retried) return this.request(userId, path, body, true);
        throw new InvalidGrantError(userId);
      }
      throw err;
    }
  }

  /** POST …/dataPoints:dailyRollUp for one civil day; returns the day's value union. */
  private async dailyRollUp(
    userId: string,
    dataType: string,
    date: string,
  ): Promise<Record<string, unknown>> {
    const res = await this.request(
      userId,
      `/users/me/dataTypes/${dataType}/dataPoints:dailyRollUp`,
      {
        range: { start: { date: civilDate(date) }, end: { date: civilDate(nextDate(date)) } },
        windowSizeDays: 1,
      },
    );
    const points = field(res, "rollupDataPoints");
    const point = asRecord(Array.isArray(points) ? points[0] : undefined);
    // value union: nested under `value` per the resource doc, but parse a
    // flattened oneof too.
    return { ...point, ...asRecord(point.value) };
  }

  /** GET …/dataPoints filtered to sessions whose civil time falls on `date`. */
  private async listSessions(
    userId: string,
    dataType: string,
    timeField: string,
    date: string,
  ): Promise<Record<string, unknown>[]> {
    const filter = encodeURIComponent(
      `${dataType}.interval.${timeField} >= "${date}T00:00:00" AND ` +
        `${dataType}.interval.${timeField} < "${nextDate(date)}T00:00:00"`,
    );
    const res = await this.request(
      userId,
      `/users/me/dataTypes/${dataType}/dataPoints?pageSize=25&filter=${filter}`,
    );
    const points = field(res, "dataPoints");
    return Array.isArray(points) ? points.map(asRecord) : [];
  }

  /**
   * Pull one user's day. Steps are required (failure throws so the run can
   * retry next tick); sleep/heart pulls are independent — failures leave
   * those fields null and the rest of the day still lands (plan §5 partial
   * sync).
   */
  async fetchDay(userId: string, date: string): Promise<DayMetrics> {
    // Steps are required — a failure here throws so the run retries next tick.
    const stepsRoll = await this.dailyRollUp(userId, "steps", date);
    const steps = asNumber(field(asRecord(field(stepsRoll, "steps")), "countSum")) ?? 0;

    // Active zone minutes double as the hr_zones source: the rollup reports
    // per-zone sums (fat burn / cardio / peak), the same zones the bingo
    // detectors key on.
    let azm: number | null = null;
    let hr_zones: Record<string, number> | null = null;
    try {
      const azmRoll = await this.dailyRollUp(userId, "active-zone-minutes", date);
      const value = asRecord(field(azmRoll, "activeZoneMinutes"));
      const fatBurn = asNumber(field(value, "sumInFatBurnHeartZone"));
      const cardio = asNumber(field(value, "sumInCardioHeartZone"));
      const peak = asNumber(field(value, "sumInPeakHeartZone"));
      if (fatBurn !== null || cardio !== null || peak !== null) {
        hr_zones = { fat_burn: fatBurn ?? 0, cardio: cardio ?? 0, peak: peak ?? 0 };
        azm = (fatBurn ?? 0) + (cardio ?? 0) + (peak ?? 0);
      }
    } catch (err) {
      if (err instanceof InvalidGrantError) throw err;
      // partial sync: missing zone data is fine
    }

    let workouts: Workout[] = [];
    try {
      const sessions = await this.listSessions(userId, "exercise", "civil_start_time", date);
      workouts = sessions.flatMap((point) => {
        const exercise = asRecord(field(point, "exercise"));
        const interval = asRecord(field(exercise, "interval"));
        const start = field(interval, "startTime");
        const duration = minutesBetween(start, field(interval, "endTime"));
        if (typeof start !== "string" || duration === null) return [];
        const exerciseType = field(exercise, "exerciseType");
        const metrics = asRecord(field(exercise, "metricsSummary"));
        return [
          {
            type:
              typeof exerciseType === "string" ? exerciseType.toLowerCase() : "workout",
            start,
            duration_min: duration,
            zone_min: asNumber(field(metrics, "activeZoneMinutes")) ?? 0,
          },
        ];
      });
    } catch (err) {
      if (err instanceof InvalidGrantError) throw err;
      // partial sync: missing exercise sessions are fine
    }

    let sleep_minutes: number | null = null;
    let bedtime: string | null = null;
    try {
      // A night's sleep belongs to the day it ends on (wake-up morning).
      const sessions = await this.listSessions(userId, "sleep", "civil_end_time", date);
      const main = asRecord(field(asRecord(sessions[0]), "sleep"));
      const summary = asRecord(field(main, "summary"));
      sleep_minutes =
        asNumber(field(summary, "minutesAsleep")) ??
        asNumber(field(summary, "minutesInSleepPeriod"));
      const start = field(asRecord(field(main, "interval")), "startTime");
      bedtime = typeof start === "string" ? start : null;
    } catch (err) {
      if (err instanceof InvalidGrantError) throw err;
      // partial sync: missing sleep is fine
    }

    return { steps, workouts, sleep_minutes, bedtime, active_zone_minutes: azm, hr_zones };
  }
}
