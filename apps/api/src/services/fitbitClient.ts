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
    };
  }
}
