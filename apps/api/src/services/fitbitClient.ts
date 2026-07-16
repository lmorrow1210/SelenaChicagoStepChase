// The ONLY module that talks to the Google Health API (plan §5).
// Real implementation lands in M8; MockFitbitClient drives M2–M7 development
// and all automated tests (never call the real API in tests — spec guardrail).

export interface Workout {
  type: string;
  start: string; // ISO datetime
  duration_min: number;
  zone_min: number;
}

export interface DayMetrics {
  steps: number;
  workouts: Workout[];
  sleep_minutes: number | null;
  bedtime: string | null; // ISO datetime
  active_zone_minutes: number | null;
  hr_zones: Record<string, number> | null; // e.g. {fat_burn: 22, cardio: 9, peak: 0}
  /** Hour-bucketed steps for the local day (24 ints summing to `steps`), or
      null when the client has no intraday data — intraday bingo detectors
      then stay incomplete rather than false-fire. */
  steps_by_hour: number[] | null;
}

export interface FitbitClient {
  /** Pull one user's metrics for a calendar date (YYYY-MM-DD, group tz). */
  fetchDay(userId: string, date: string): Promise<DayMetrics>;
}

/**
 * Deterministic fake: same user+date always yields the same plausible day,
 * so fixtures and assertions are stable. Override specific days via `set`.
 */
export class MockFitbitClient implements FitbitClient {
  private overrides = new Map<string, DayMetrics>();

  set(userId: string, date: string, metrics: DayMetrics): void {
    this.overrides.set(`${userId}|${date}`, metrics);
  }

  async fetchDay(userId: string, date: string): Promise<DayMetrics> {
    const override = this.overrides.get(`${userId}|${date}`);
    if (override) return override;

    // cheap deterministic hash of user+date
    let h = 0;
    for (const c of `${userId}|${date}`) h = (h * 31 + c.charCodeAt(0)) | 0;
    const r = (n: number) => Math.abs(h % n);

    const steps = 4000 + r(9000); // 4k–13k
    const workedOut = r(10) < 6; // ~60% of days
    return {
      steps,
      workouts: workedOut
        ? [{ type: "walk", start: `${date}T17:30:00Z`, duration_min: 20 + r(40), zone_min: r(30) }]
        : [],
      sleep_minutes: 360 + r(180),
      bedtime: `${date}T0${3 + r(3)}:1${r(9)}:00Z`,
      active_zone_minutes: workedOut ? 10 + r(50) : r(10),
      hr_zones: { fat_burn: r(40), cardio: r(15), peak: r(5) },
      steps_by_hour: hourlySplit(steps, h),
    };
  }
}

/**
 * Deterministically bucket a day total into 24 hourly counts that sum to
 * exactly `total`: a fixed waking-day profile (commute / lunch / evening
 * bumps, quiet nights), with the rounding remainder dropped round-robin
 * starting at a seeded hour so different users differ slightly.
 */
export function hourlySplit(total: number, seed: number): number[] {
  const profile = [0, 0, 0, 0, 0, 1, 2, 4, 6, 5, 4, 5, 6, 5, 4, 4, 5, 7, 8, 6, 4, 3, 2, 1];
  const weight = profile.reduce((a, b) => a + b, 0);
  const out = profile.map((w) => Math.floor((total * w) / weight));
  let rem = total - out.reduce((a, b) => a + b, 0);
  let i = Math.abs(seed) % 24;
  while (rem > 0) {
    if (profile[i] > 0) {
      out[i]++;
      rem--;
    }
    i = (i + 1) % 24;
  }
  return out;
}
