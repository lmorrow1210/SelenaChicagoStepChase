import { describe, expect, it } from "vitest";
import {
  calculateDataConfidence,
  calculateDataConfidenceFromFreshness,
  classifyTrackerFreshness,
} from "../src/services/dataConfidence.js";

const now = new Date("2026-06-10T18:00:00Z");

describe("classifyTrackerFreshness", () => {
  it("classifies current, delayed, stale, missing, and disconnected tracker data", () => {
    expect(classifyTrackerFreshness({ userId: "a", lastSyncedAt: "2026-06-10T12:00:00Z", fitbitConnected: true }, now)).toBe("current");
    expect(classifyTrackerFreshness({ userId: "a", lastSyncedAt: "2026-06-10T11:59:00Z", fitbitConnected: true }, now)).toBe("delayed");
    expect(classifyTrackerFreshness({ userId: "a", lastSyncedAt: "2026-06-09T18:00:00Z", fitbitConnected: true }, now)).toBe("delayed");
    expect(classifyTrackerFreshness({ userId: "a", lastSyncedAt: "2026-06-09T17:59:00Z", fitbitConnected: true }, now)).toBe("stale");
    expect(classifyTrackerFreshness({ userId: "a", lastSyncedAt: null, fitbitConnected: true }, now)).toBe("missing");
    expect(classifyTrackerFreshness({ userId: "a", lastSyncedAt: "2026-06-10T12:00:00Z", fitbitConnected: false }, now)).toBe("disconnected");
  });
});

describe("calculateDataConfidence", () => {
  it("returns verified only when every active tracker is current", () => {
    const result = calculateDataConfidence({
      now,
      trackers: [
        { userId: "a", lastSyncedAt: "2026-06-10T12:00:00Z", fitbitConnected: true },
        { userId: "b", lastSyncedAt: "2026-06-10T13:00:00Z", fitbitConnected: true },
      ],
    });

    expect(result.dataConfidence).toBe("verified");
    expect(result.counts.current).toBe(2);
  });

  it("returns estimated for delayed data below the incomplete threshold", () => {
    const result = calculateDataConfidenceFromFreshness({
      trackerSync: [
        { userId: "a", freshness: "current" },
        { userId: "b", freshness: "current" },
        { userId: "c", freshness: "delayed" },
        { userId: "d", freshness: "current" },
      ],
    });

    expect(result.dataConfidence).toBe("estimated");
  });

  it("returns incomplete when stale, missing, or disconnected trackers reach 30 percent", () => {
    const result = calculateDataConfidenceFromFreshness({
      trackerSync: [
        { userId: "a", freshness: "current" },
        { userId: "b", freshness: "current" },
        { userId: "c", freshness: "stale" },
      ],
    });

    expect(result.dataConfidence).toBe("incomplete");
  });

  it("returns recalculating when a recalculation is in progress", () => {
    const result = calculateDataConfidenceFromFreshness({
      recalculating: true,
      trackerSync: [
        { userId: "a", freshness: "current" },
        { userId: "b", freshness: "missing" },
      ],
    });

    expect(result.dataConfidence).toBe("recalculating");
  });

  it("treats an empty tracker list as incomplete", () => {
    expect(calculateDataConfidenceFromFreshness({ trackerSync: [] }).dataConfidence).toBe("incomplete");
  });
});
