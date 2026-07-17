import { describe, expect, it } from "vitest";
import { evaluateDetector, type DetectorContext } from "../src/services/bingo.js";

function ctx(overrides: Partial<DetectorContext> = {}): DetectorContext {
  return {
    steps: 0,
    workouts: [],
    sleep_minutes: null,
    active_zone_minutes: null,
    hr_zones: null,
    ...overrides,
  };
}

describe("Week 1 reusable detectors", () => {
  it("percent_target_in_day compares steps to the daily target fraction", () => {
    const detector = { metric: "percent_target_in_day", pct: 0.5 };
    expect(evaluateDetector(detector, ctx({ steps: 5000, daily_target: 10000 }))).toBe(true);
    expect(evaluateDetector(detector, ctx({ steps: 4999, daily_target: 10000 }))).toBe(false);
    // No target context → tile stays incomplete, never false-fires.
    expect(evaluateDetector(detector, ctx({ steps: 5000 }))).toBe(false);
    expect(evaluateDetector({ metric: "percent_target_in_day", pct: 1 }, ctx({ steps: 10000, daily_target: 10000 }))).toBe(true);
  });

  it("consecutive_days needs an unbroken calendar run at the step floor", () => {
    const detector = { metric: "consecutive_days", days: 2, min_steps: 2000 };
    const run = [
      { date: "2026-06-08", steps: 2500 },
      { date: "2026-06-09", steps: 2100 },
    ];
    expect(evaluateDetector(detector, ctx({ week_step_days: run }))).toBe(true);
    const broken = [
      { date: "2026-06-08", steps: 2500 },
      { date: "2026-06-10", steps: 2100 }, // gap on the 9th
    ];
    expect(evaluateDetector(detector, ctx({ week_step_days: broken }))).toBe(false);
    const belowFloor = [
      { date: "2026-06-08", steps: 2500 },
      { date: "2026-06-09", steps: 1999 },
    ];
    expect(evaluateDetector(detector, ctx({ week_step_days: belowFloor }))).toBe(false);
  });

  it("active_days counts qualifying days without needing consecutiveness", () => {
    const detector = { metric: "active_days", days: 5, min_steps: 500 };
    const days = ["08", "09", "11", "12", "14"].map((d) => ({ date: `2026-06-${d}`, steps: 600 }));
    expect(evaluateDetector(detector, ctx({ week_step_days: days }))).toBe(true);
    expect(evaluateDetector(detector, ctx({ week_step_days: days.slice(0, 4) }))).toBe(false);
  });

  it("weekly_steps uses the personal week total", () => {
    const detector = { metric: "weekly_steps", op: ">=", value: 15000 };
    expect(evaluateDetector(detector, ctx({ week_steps_total: 15000 }))).toBe(true);
    expect(evaluateDetector(detector, ctx({ week_steps_total: 14999 }))).toBe(false);
    expect(evaluateDetector(detector, ctx({}))).toBe(false);
  });

  it("split_shift needs both dayparts and stays incomplete without intraday data", () => {
    const detector = { metric: "split_shift", morning_hour: 12, evening_hour: 18, value: 1000 };
    const buckets = Array(24).fill(0);
    buckets[9] = 1200;
    buckets[19] = 1100;
    expect(evaluateDetector(detector, ctx({ steps_by_hour: buckets }))).toBe(true);
    const morningOnly = Array(24).fill(0);
    morningOnly[9] = 5000;
    expect(evaluateDetector(detector, ctx({ steps_by_hour: morningOnly }))).toBe(false);
    expect(evaluateDetector(detector, ctx({ steps_by_hour: null }))).toBe(false);
  });

  it("assist detectors read Gift-a-Tile counts", () => {
    expect(evaluateDetector({ metric: "assist_sent", op: ">=", value: 1 }, ctx({ assists_sent: 1 }))).toBe(true);
    expect(evaluateDetector({ metric: "assist_sent", op: ">=", value: 1 }, ctx({ assists_sent: 0 }))).toBe(false);
    expect(evaluateDetector({ metric: "assist_received", op: ">=", value: 1 }, ctx({ assists_received: 1 }))).toBe(true);
    expect(evaluateDetector({ metric: "assist_received", op: ">=", value: 1 }, ctx({}))).toBe(false);
  });

  it("group_daily_target_ratio counts members at the target fraction", () => {
    const detector = { metric: "group_daily_target_ratio", min_members: 3, pct: 0.5 };
    const progress = (steps: number[]) =>
      ctx({ group_day_progress: steps.map((s) => ({ steps: s, daily_target: 10000 })) });
    expect(evaluateDetector(detector, progress([5000, 6000, 5000, 100]))).toBe(true);
    expect(evaluateDetector(detector, progress([5000, 6000, 4999]))).toBe(false);
  });

  it("group_sync_freshness requires every tracker within the window", () => {
    const detector = { metric: "group_sync_freshness", within_hours: 24 };
    expect(evaluateDetector(detector, ctx({ group_sync_ages_hours: [1, 5, 23.9] }))).toBe(true);
    expect(evaluateDetector(detector, ctx({ group_sync_ages_hours: [1, 25] }))).toBe(false);
    // A never-synced tracker keeps the tile incomplete (trust rule).
    expect(evaluateDetector(detector, ctx({ group_sync_ages_hours: [1, null] }))).toBe(false);
    expect(evaluateDetector(detector, ctx({ group_sync_ages_hours: [] }))).toBe(false);
  });
});
