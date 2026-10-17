/**
 * Google Health API live smoke test (owner-run, never part of CI/tests).
 *
 *   HEALTH_ACCESS_TOKEN=ya29... npx tsx apps/api/scripts/health-smoke.ts [YYYY-MM-DD]
 *
 * Reuses RealFitbitClient (the exact code production runs) with a recording
 * fetch wrapper, then runs a few extra read-only probes for things the client
 * does not call yet (identity, raw step intervals, hourly roll-up, heart-rate
 * zone roll-up).
 *
 * PRIVACY: prints ONLY status codes, JSON shape (key names + value TYPES) and
 * record counts. It never prints a value from a response, the token, or an
 * email. Do not add console.log of response bodies here.
 */
import { RealFitbitClient } from "../src/services/realFitbitClient.js";

const API_BASE = process.env.HEALTH_API_BASE ?? "https://health.googleapis.com/v4";

class SmokeClient extends RealFitbitClient {
  constructor(
    private readonly token: string,
    fetchImpl: typeof fetch,
  ) {
    super(null as never, fetchImpl);
  }
  protected override async accessToken(): Promise<string> {
    return this.token;
  }
}

/** Key names + value types only. Arrays become `{_array: n, _item: <shape of first>}`. */
export function shape(value: unknown, depth = 5): unknown {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    return value.length === 0 ? { _array: 0 } : { _array: value.length, _item: shape(value[0], depth - 1) };
  }
  if (typeof value === "object") {
    if (depth <= 0) return "{...}";
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, shape(v, depth - 1)]),
    );
  }
  return typeof value; // "string" | "number" | "boolean" — never the value
}

/** Safe part of a Google error body: numeric code + status enum only. */
function safeError(body: unknown): string {
  const e = (body as { error?: { code?: unknown; status?: unknown } } | null)?.error;
  const code = typeof e?.code === "number" ? e.code : "?";
  const status = typeof e?.status === "string" && /^[A-Z_]{3,40}$/.test(e.status) ? e.status : "?";
  return `error.code=${code} error.status=${status}`;
}

interface Row {
  label: string;
  method: string;
  path: string;
  status: number;
  note: string;
}
const rows: Row[] = [];
let currentLabel = "client";

const recordingFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  const url = new URL(String(input));
  const path = url.pathname.replace(/^\/v4/, "") + (url.search ? "?<query>" : "");
  let note = "";
  try {
    const body: unknown = await res.clone().json();
    if (!res.ok) note = safeError(body);
    else if (body && typeof body === "object") {
      const o = body as Record<string, unknown>;
      const counts = Object.entries(o)
        .filter(([, v]) => Array.isArray(v))
        .map(([k, v]) => `${k}=${(v as unknown[]).length}`);
      note = `keys=[${Object.keys(o).join(",")}]${counts.length ? ` counts: ${counts.join(" ")}` : ""}`;
      if (process.env.SMOKE_SHAPE === "1") note += `\n        shape=${JSON.stringify(shape(body))}`;
    }
  } catch {
    note = "(non-JSON body)";
  }
  rows.push({ label: currentLabel, method: init?.method ?? "GET", path, status: res.status, note });
  return res;
};

function nextDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
function civil(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { date: { year, month, day } };
}

async function main(): Promise<void> {
  const token = process.env.HEALTH_ACCESS_TOKEN;
  if (!token) {
    console.error("Set HEALTH_ACCESS_TOKEN (an OAuth access token, see docs/LAUNCH-RUNBOOK.md step 2).");
    process.exit(2);
  }
  const date = process.argv[2] ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error("Date must be YYYY-MM-DD");
    process.exit(2);
  }
  console.log(`Health API smoke test  base=${API_BASE}  date=${date}\n`);

  // ---- 1. The real client, exactly as the cron/sync route runs it ----------
  const client = new SmokeClient(token, recordingFetch);
  currentLabel = "RealFitbitClient.fetchDay";
  let dayErr: string | null = null;
  let day: Awaited<ReturnType<RealFitbitClient["fetchDay"]>> | null = null;
  try {
    day = await client.fetchDay("smoke", date);
  } catch (err) {
    dayErr = err instanceof Error ? err.constructor.name : "unknown error";
  }

  // ---- 2. Extra read-only probes for gaps the client does not cover --------
  const hdr = (json: boolean) => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  });
  const probe = async (label: string, method: "GET" | "POST", path: string, body?: unknown) => {
    currentLabel = label;
    await recordingFetch(`${API_BASE}${path}`, {
      method,
      headers: hdr(body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };
  const q = (s: string) => encodeURIComponent(s);

  await probe("probe: identity", "GET", "/users/me/identity");
  await probe(
    "probe: raw step intervals (intraday via list)",
    "GET",
    `/users/me/dataTypes/steps/dataPoints?pageSize=1440&filter=${q(
      `steps.interval.civil_start_time >= "${date}T00:00:00" AND steps.interval.civil_start_time < "${nextDate(date)}T00:00:00"`,
    )}`,
  );
  await probe("probe: hourly rollUp (UTC window, 3600s)", "POST", "/users/me/dataTypes/steps/dataPoints:rollUp", {
    range: { startTime: `${date}T00:00:00Z`, endTime: `${nextDate(date)}T00:00:00Z` },
    windowSize: "3600s",
  });
  for (const type of ["time-in-heart-rate-zone", "calories-in-heart-rate-zone"]) {
    await probe(`probe: ${type} dailyRollUp`, "POST", `/users/me/dataTypes/${type}/dataPoints:dailyRollUp`, {
      range: { start: civil(date), end: civil(nextDate(date)) },
      windowSizeDays: 1,
    });
  }
  // Always dump the SHAPE of the AZM rollup, sleep and exercise lists: those
  // are the field names the client parses defensively and we want confirmed.
  process.env.SMOKE_SHAPE = "1";
  await probe("shape: active-zone-minutes dailyRollUp", "POST", "/users/me/dataTypes/active-zone-minutes/dataPoints:dailyRollUp", {
    range: { start: civil(date), end: civil(nextDate(date)) },
    windowSizeDays: 1,
  });
  await probe("shape: steps dailyRollUp", "POST", "/users/me/dataTypes/steps/dataPoints:dailyRollUp", {
    range: { start: civil(date), end: civil(nextDate(date)) },
    windowSizeDays: 1,
  });
  for (const [type, field] of [
    ["exercise", "civil_start_time"],
    ["sleep", "civil_end_time"],
  ] as const) {
    await probe(
      `shape: ${type} list`,
      "GET",
      `/users/me/dataTypes/${type}/dataPoints?pageSize=25&filter=${q(
        `${type}.interval.${field} >= "${date}T00:00:00" AND ${type}.interval.${field} < "${nextDate(date)}T00:00:00"`,
      )}`,
    );
  }

  // ---- 3. Report ----------------------------------------------------------
  let lastLabel = "";
  for (const r of rows) {
    if (r.label !== lastLabel) console.log(`\n[${r.label}]`);
    lastLabel = r.label;
    console.log(`  ${r.status}  ${r.method.padEnd(4)} ${r.path}\n        ${r.note}`);
  }

  console.log("\n[RealFitbitClient.fetchDay result - presence only, no values]");
  if (!day) {
    console.log(`  FAILED: ${dayErr}  (a 401/403 above usually means expired token or missing scope)`);
  } else {
    console.log(`  steps:               ${day.steps > 0 ? "non-zero" : "ZERO (check the date has data and the dataSource is right)"}`);
    console.log(`  workouts:            ${day.workouts.length} found`);
    console.log(`  sleep_minutes:       ${day.sleep_minutes === null ? "null (no sleep parsed)" : "parsed"}`);
    console.log(`  bedtime:             ${day.bedtime === null ? "null" : "parsed (ISO string)"}`);
    console.log(`  active_zone_minutes: ${day.active_zone_minutes === null ? "null (AZM field names did not match)" : "parsed"}`);
    console.log(`  hr_zones:            ${day.hr_zones === null ? "null" : "parsed"}`);
    console.log(`  steps_by_hour:       ${day.steps_by_hour === null ? "null (expected until hourly rollup is wired)" : "present"}`);
  }

  const bad = rows.filter((r) => r.status >= 400 && !r.label.startsWith("probe:"));
  console.log(
    `\n${bad.length ? "NOT READY" : "READY"}: ${bad.length} failing call(s) from the real client path. ` +
      "Probe failures (label starts with 'probe:') are informational.",
  );
  process.exit(bad.length || !day ? 1 : 0);
}

void main();
