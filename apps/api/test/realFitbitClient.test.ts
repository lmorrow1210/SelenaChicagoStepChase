import { describe, expect, it } from "vitest";
import type { Pool } from "pg";
import { InvalidGrantError, RealFitbitClient } from "../src/services/realFitbitClient.js";

// Never calls the real API: fetch is faked, and the private accessToken
// step (DB + Google OAuth) is stubbed out at runtime.

interface Call {
  url: string;
  method: string;
  body: unknown;
}

function makeClient(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({
      url,
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
    });
    return handler(url, init);
  }) as typeof fetch;

  const client = new RealFitbitClient({} as Pool, fetchImpl);
  (client as unknown as { accessToken: (userId: string) => Promise<string> }).accessToken =
    async () => "test-token";
  return { client, calls };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const DATE = "2026-06-10";

function happyHandler(url: string): Response {
  if (url.includes("/dataTypes/steps/dataPoints:dailyRollUp")) {
    return json({
      rollupDataPoints: [{ value: { steps: { countSum: "11432" } } }],
    });
  }
  if (url.includes("/dataTypes/active-zone-minutes/dataPoints:dailyRollUp")) {
    return json({
      rollupDataPoints: [
        {
          value: {
            activeZoneMinutes: {
              sumInFatBurnHeartZone: "22",
              sumInCardioHeartZone: "9",
              sumInPeakHeartZone: "1",
            },
          },
        },
      ],
    });
  }
  if (url.includes("/dataTypes/exercise/dataPoints?")) {
    return json({
      dataPoints: [
        {
          exercise: {
            interval: {
              startTime: `${DATE}T17:30:00Z`,
              endTime: `${DATE}T18:05:00Z`,
            },
            exerciseType: "RUNNING",
            metricsSummary: { activeZoneMinutes: "28" },
          },
        },
      ],
    });
  }
  if (url.includes("/dataTypes/sleep/dataPoints?")) {
    return json({
      dataPoints: [
        {
          sleep: {
            interval: { startTime: "2026-06-09T23:10:00Z", endTime: `${DATE}T06:40:00Z` },
            summary: { minutesAsleep: "412", minutesInSleepPeriod: "450" },
          },
        },
      ],
    });
  }
  return json({ error: { message: "unexpected path" } }, 404);
}

describe("RealFitbitClient against the verified Google Health API surface", () => {
  it("fetchDay maps rollups + sessions into DayMetrics and hits the documented paths", async () => {
    const { client, calls } = makeClient(happyHandler);
    const day = await client.fetchDay("u1", DATE);

    expect(day).toEqual({
      steps: 11432,
      workouts: [{ type: "running", start: `${DATE}T17:30:00Z`, duration_min: 35, zone_min: 28 }],
      sleep_minutes: 412,
      bedtime: "2026-06-09T23:10:00Z",
      active_zone_minutes: 32,
      hr_zones: { fat_burn: 22, cardio: 9, peak: 1 },
    });

    const stepsCall = calls.find((c) => c.url.includes("steps/dataPoints:dailyRollUp"));
    expect(stepsCall?.method).toBe("POST");
    expect(stepsCall?.body).toEqual({
      range: {
        start: { date: { year: 2026, month: 6, day: 10 } },
        end: { date: { year: 2026, month: 6, day: 11 } },
      },
      windowSizeDays: 1,
    });

    const sleepCall = calls.find((c) => c.url.includes("/dataTypes/sleep/dataPoints?"));
    expect(sleepCall?.method).toBe("GET");
    expect(decodeURIComponent(sleepCall?.url ?? "")).toContain(
      `sleep.interval.civil_end_time >= "${DATE}T00:00:00"`,
    );
  });

  it("parses proto snake_case field names too (live casing unconfirmed)", async () => {
    const { client } = makeClient((url) => {
      if (url.includes("steps/dataPoints:dailyRollUp")) {
        return json({ rollup_data_points: [{ steps: { count_sum: "9001" } }] });
      }
      if (url.includes("active-zone-minutes")) {
        return json({
          rollup_data_points: [
            { active_zone_minutes: { sum_in_cardio_heart_zone: "12" } },
          ],
        });
      }
      return json({ data_points: [] });
    });
    const day = await client.fetchDay("u1", DATE);
    expect(day.steps).toBe(9001);
    expect(day.hr_zones).toEqual({ fat_burn: 0, cardio: 12, peak: 0 });
    expect(day.active_zone_minutes).toBe(12);
    expect(day.workouts).toEqual([]);
  });

  it("partial sync: sleep/exercise/zone failures still land the day; steps failure throws", async () => {
    const { client } = makeClient((url) => {
      if (url.includes("steps/dataPoints:dailyRollUp")) {
        return json({ rollupDataPoints: [{ value: { steps: { countSum: "5000" } } }] });
      }
      return json({ error: { message: "boom" } }, 500);
    });
    const day = await client.fetchDay("u1", DATE);
    expect(day.steps).toBe(5000);
    expect(day.sleep_minutes).toBeNull();
    expect(day.hr_zones).toBeNull();
    expect(day.workouts).toEqual([]);

    const { client: broken } = makeClient(() => json({ error: { message: "boom" } }, 500));
    await expect(broken.fetchDay("u1", DATE)).rejects.toThrow("Health API 500");
  });

  it("401 → drop cached token, retry once, second 401 = InvalidGrantError", async () => {
    let attempts = 0;
    const { client } = makeClient(() => {
      attempts += 1;
      return json({ error: { message: "unauthorized" } }, 401);
    });
    await expect(client.fetchDay("u1", DATE)).rejects.toBeInstanceOf(InvalidGrantError);
    expect(attempts).toBe(2);
  });
});
