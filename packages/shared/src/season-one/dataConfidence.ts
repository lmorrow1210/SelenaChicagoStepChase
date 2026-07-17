import type { DataConfidence } from "@one-step-ahead/shared";

export type TrackerFreshness = "current" | "delayed" | "stale" | "missing" | "disconnected";

export interface TrackerFreshnessInput {
  userId: string;
  lastSyncedAt: Date | string | null;
  fitbitConnected: boolean;
}

export interface TrackerSyncState {
  userId: string;
  freshness: TrackerFreshness;
}

export interface DataConfidenceInput {
  trackers: TrackerFreshnessInput[];
  now: Date | string;
  recalculating?: boolean;
}

export interface DataConfidenceFromFreshnessInput {
  trackerSync: TrackerSyncState[];
  recalculating?: boolean;
}

export interface DataConfidenceResult {
  dataConfidence: DataConfidence;
  trackers: TrackerSyncState[];
  counts: Record<TrackerFreshness, number>;
}

const HOURS = 60 * 60 * 1000;

export function classifyTrackerFreshness(input: TrackerFreshnessInput, now: Date | string): TrackerFreshness {
  if (!input.fitbitConnected) return "disconnected";
  if (!input.lastSyncedAt) return "missing";

  const syncTime = new Date(input.lastSyncedAt).getTime();
  const nowTime = new Date(now).getTime();
  if (!Number.isFinite(syncTime) || !Number.isFinite(nowTime)) return "missing";

  const ageHours = Math.max(0, nowTime - syncTime) / HOURS;
  if (ageHours <= 6) return "current";
  if (ageHours <= 24) return "delayed";
  return "stale";
}

export function calculateDataConfidence(input: DataConfidenceInput): DataConfidenceResult {
  const trackers = input.trackers.map((tracker) => ({
    userId: tracker.userId,
    freshness: classifyTrackerFreshness(tracker, input.now),
  }));

  return calculateDataConfidenceFromFreshness({ trackerSync: trackers, recalculating: input.recalculating });
}

export function calculateDataConfidenceFromFreshness(
  input: DataConfidenceFromFreshnessInput,
): DataConfidenceResult {
  const trackers = input.trackerSync.map((tracker) => ({ ...tracker }));
  const counts: Record<TrackerFreshness, number> = {
    current: 0,
    delayed: 0,
    stale: 0,
    missing: 0,
    disconnected: 0,
  };

  for (const tracker of trackers) {
    counts[tracker.freshness] += 1;
  }

  if (input.recalculating) {
    return { dataConfidence: "recalculating", trackers, counts };
  }

  if (trackers.length === 0) {
    return { dataConfidence: "incomplete", trackers, counts };
  }

  const incompleteCount = counts.stale + counts.missing + counts.disconnected;
  if (incompleteCount / trackers.length >= 0.3) {
    return { dataConfidence: "incomplete", trackers, counts };
  }

  const nonCurrentCount = trackers.length - counts.current;
  if (nonCurrentCount > 0) {
    return { dataConfidence: "estimated", trackers, counts };
  }

  return { dataConfidence: "verified", trackers, counts };
}
