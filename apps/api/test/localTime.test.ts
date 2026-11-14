import { describe, expect, it } from "vitest";
import { toLocalAsZ } from "../src/lib/localTime.js";
import { evaluateDetector, type DetectorContext } from "../src/services/bingo.js";

describe("toLocalAsZ", () => {
  it("converts a UTC instant to Chicago wall clock in CDT (UTC-5)", () => {
    expect(toLocalAsZ("2026-06-03T12:30:00Z", "America/Chicago")).toBe("2026-06-03T07:30:00Z");
    // 10:45 PM Tuesday in Chicago is already Wednesday in UTC
    expect(toLocalAsZ("2026-06-03T03:45:00Z", "America/Chicago")).toBe("2026-06-02T22:45:00Z");
  });

  it("converts in CST (UTC-6) after the November change", () => {
    expect(toLocalAsZ("2026-11-10T13:30:00Z", "America/Chicago")).toBe("2026-11-10T07:30:00Z");
    expect(toLocalAsZ("2026-11-11T04:45:00Z", "America/Chicago")).toBe("2026-11-10T22:45:00Z");
  });

  it("uses the offset in force at each instant across the fall-back night", () => {
    // Sat Oct 31 2026 10:30 PM CDT, then Sun Nov 1 10:30 PM CST
    expect(toLocalAsZ("2026-11-01T03:30:00Z", "America/Chicago")).toBe("2026-10-31T22:30:00Z");
    expect(toLocalAsZ("2026-11-02T04:30:00Z", "America/Chicago")).toBe("2026-11-01T22:30:00Z");
  });

  it("handles zones east of UTC and midnight as hour 00", () => {
    expect(toLocalAsZ("2026-06-02T21:30:00Z", "Europe/London")).toBe("2026-06-02T22:30:00Z");
    expect(toLocalAsZ("2026-06-03T05:00:00Z", "America/Chicago")).toBe("2026-06-03T00:00:00Z");
  });

  it("accepts Date objects and offset-bearing strings", () => {
    expect(toLocalAsZ(new Date("2026-06-03T12:30:00Z"), "America/Chicago")).toBe("2026-06-03T07:30:00Z");
    expect(toLocalAsZ("2026-06-03T07:30:00-05:00", "America/Chicago")).toBe("2026-06-03T07:30:00Z");
  });

  it("returns null for missing or unparseable input and unknown zones", () => {
    expect(toLocalAsZ(null, "America/Chicago")).toBeNull();
    expect(toLocalAsZ("not a date", "America/Chicago")).toBeNull();
    expect(toLocalAsZ("2026-06-03T12:30:00Z", "Mars/Olympus")).toBeNull();
  });
});

describe("time-of-day detectors on converted Health-API instants (Chicago)", () => {
  const tz = "America/Chicago";
  const base: DetectorContext = {
    steps: 0,
    workouts: [],
    sleep_minutes: null,
    active_zone_minutes: null,
    hr_zones: null,
  };
  const workoutAt = (utc: string) => ({
    ...base,
    workouts: [{ start: toLocalAsZ(utc, tz) ?? "", duration_min: 30 }],
  });
  const before8 = { metric: "workout_before", hour: 8, op: ">=", value: 1 };

  it("workout_before 8: 7:30 AM local passes, 8:15 AM fails (CDT and CST)", () => {
    expect(evaluateDetector(before8, workoutAt("2026-06-03T12:30:00Z"))).toBe(true); // 7:30 CDT
    expect(evaluateDetector(before8, workoutAt("2026-06-03T13:15:00Z"))).toBe(false); // 8:15 CDT
    expect(evaluateDetector(before8, workoutAt("2026-11-10T13:30:00Z"))).toBe(true); // 7:30 CST
    expect(evaluateDetector(before8, workoutAt("2026-11-10T14:15:00Z"))).toBe(false); // 8:15 CST
  });

  it("workout_before 8: an evening workout no longer false-fires", () => {
    // 7:30 PM CDT is 00:30 UTC next day — the raw UTC hour (0) used to pass
    expect(evaluateDetector(before8, workoutAt("2026-06-04T00:30:00Z"))).toBe(false);
  });

  const night = (wakeDate: string, bedUtc: string | null) => ({
    ...base,
    week_bedtimes: [{ date: wakeDate, bedtime: toLocalAsZ(bedUtc, tz) }],
  });
  const before11 = { metric: "bedtime_before", hour: 23, nights: 1 };

  it("bedtime_before 11: 10:45 PM passes; 11:15 PM and 1 AM fail (CDT)", () => {
    expect(evaluateDetector(before11, night("2026-06-03", "2026-06-03T03:45:00Z"))).toBe(true);
    expect(evaluateDetector(before11, night("2026-06-03", "2026-06-03T04:15:00Z"))).toBe(false);
    expect(evaluateDetector(before11, night("2026-06-03", "2026-06-03T06:00:00Z"))).toBe(false);
  });

  it("bedtime_before 11: same wall-clock results in CST", () => {
    expect(evaluateDetector(before11, night("2026-11-11", "2026-11-11T04:45:00Z"))).toBe(true);
    expect(evaluateDetector(before11, night("2026-11-11", "2026-11-11T05:15:00Z"))).toBe(false);
    expect(evaluateDetector(before11, night("2026-11-11", "2026-11-11T07:00:00Z"))).toBe(false);
  });

  it("bedtime_before: 6 PM floor and null bedtime still hold", () => {
    expect(evaluateDetector(before11, night("2026-06-03", "2026-06-02T22:30:00Z"))).toBe(false); // 5:30 PM
    expect(evaluateDetector(before11, night("2026-06-03", "2026-06-02T23:05:00Z"))).toBe(true); // 6:05 PM
    expect(evaluateDetector(before11, night("2026-06-03", null))).toBe(false);
  });
});
