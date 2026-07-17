import type { DataConfidence, WeekPhase, WeeklyOutcome } from "@one-step-ahead/shared";
import { SEASON_ONE_CONFIG, WEEK_ONE_CHICAGO } from "@one-step-ahead/shared/season-one/seasonOne";
import { calculateChase, type ChaseCalculationResult } from "@one-step-ahead/shared/season-one/chase";
import {
  calculateDataConfidenceFromFreshness,
  type TrackerSyncState,
} from "@one-step-ahead/shared/season-one/dataConfidence";
import { calculateWeeklyPhase } from "@one-step-ahead/shared/season-one/weeklyPhase";
import { selectPrimaryAction, type PrimaryAction } from "@one-step-ahead/shared/season-one/primaryAction";

export const WEEK_SIMULATOR_PHASES: WeekPhase[] = [
  "briefing",
  "active",
  "midweek_update",
  "final_push",
  "sudden_death",
  "case_closing",
  "case_closed",
];

export const WEEK_SIMULATOR_OUTCOMES: WeeklyOutcome[] = [
  "trail_lost",
  "pursuit_maintained",
  "close_encounter",
  "interception",
];

export const WEEK_SIMULATOR_CONFIDENCE: DataConfidence[] = [
  "verified",
  "estimated",
  "incomplete",
  "recalculating",
];

export interface WeekSimulatorControls {
  phase: WeekPhase;
  outcome: WeeklyOutcome;
  dataConfidence: DataConfidence;
  baseProgress: number;
  fieldOpsAverageLines: 0 | 1 | 2 | 3;
  platformSweepBonus: 0 | 0.01 | 0.02 | 0.03;
  nemesisMode: "none" | "partial" | "complete";
  predictionSubmitted: boolean;
}

export interface WeekSimulatorState {
  seasonState: {
    season: {
      id: string;
      title: string;
      weekNumber: number;
      totalWeeks: number;
    };
    chapter: {
      city: string;
      title: string;
      complication: string;
      nextCity: string;
    };
    phase: WeekPhase;
    dataConfidence: DataConfidence;
    chase: ChaseCalculationResult;
    primaryAction: PrimaryAction;
    sync: {
      lastUpdatedAt: string | null;
      incompletePlayerCount: number;
      stalePlayerCount: number;
    };
  };
  platformSweep: {
    label: string;
    placeholder: true;
    earnedBonus: number;
    contributors: number;
    eligiblePlayers: number;
  };
  ritualFlags: {
    suddenDeathActive: boolean;
    predictionSubmitted: boolean;
    briefingViewed: boolean;
  };
}

const GROUP_TARGET = 210000;
const ACTIVE_PLAYERS = 4;
const WEEK_START = "2026-06-08";
const WEEK_END = "2026-06-14";
const TIMEZONE = "America/Chicago";

export const DEFAULT_WEEK_SIMULATOR_CONTROLS: WeekSimulatorControls = {
  phase: "briefing",
  outcome: "close_encounter",
  dataConfidence: "verified",
  baseProgress: 0.92,
  fieldOpsAverageLines: 0,
  platformSweepBonus: 0,
  nemesisMode: "none",
  predictionSubmitted: false,
};

export function progressForOutcome(outcome: WeeklyOutcome): number {
  switch (outcome) {
    case "trail_lost":
      return 0.65;
    case "pursuit_maintained":
      return 0.8;
    case "close_encounter":
      return 0.94;
    case "interception":
      return 1.02;
  }
}

export function buildWeekSimulatorState(controls: WeekSimulatorControls): WeekSimulatorState {
  const phaseFixture = fixtureForPhase(controls.phase, controls.outcome, controls.dataConfidence);
  const trackerSync = trackerSyncForConfidence(controls.dataConfidence);
  const confidence = calculateDataConfidenceFromFreshness({
    trackerSync,
    recalculating: controls.dataConfidence === "recalculating",
  });
  const verifiedGroupSteps = Math.round(GROUP_TARGET * Math.max(0, controls.baseProgress));
  const chase = calculateChase({
    activePlayers: splitStepsAcrossPlayers(verifiedGroupSteps),
    fieldOps: {
      activePlayerCount: ACTIVE_PLAYERS,
      totalQualifyingLines: controls.fieldOpsAverageLines * ACTIVE_PLAYERS,
    },
    specialOperation: {
      maxBonus: 0.03,
      earnedBonus: controls.platformSweepBonus,
      contributors: controls.platformSweepBonus === 0 ? 0 : Math.ceil(ACTIVE_PLAYERS * 0.6),
      eligiblePlayers: ACTIVE_PLAYERS,
    },
    nemesis: nemesisForMode(controls.nemesisMode),
    prediction: {
      activePlayerCount: ACTIVE_PLAYERS,
      submittedCount: controls.predictionSubmitted ? ACTIVE_PLAYERS : 0,
    },
    trackerSync,
    elapsedFractionOfWeek: phaseFixture.elapsedFractionOfWeek,
    now: phaseFixture.now,
    groupWeeklyTargetSnapshot: GROUP_TARGET,
    dataConfidence: confidence.dataConfidence,
    final: controls.phase === "case_closed",
  });
  const phaseResult = calculateWeeklyPhase({
    startsOn: WEEK_START,
    endsOn: WEEK_END,
    timezone: TIMEZONE,
    weekStatus: phaseFixture.weekStatus,
    finalOutcome: controls.phase === "case_closed" ? chase.finalOutcome : null,
    finalizedAt: controls.phase === "case_closed" ? phaseFixture.now : null,
    dataConfidence: confidence.dataConfidence,
    briefingViewed: phaseFixture.briefingViewed,
    midweekViewed: phaseFixture.midweekViewed,
    finalPushViewed: phaseFixture.finalPushViewed,
    caseClosedViewed: false,
    suddenDeathActive: phaseFixture.suddenDeathActive,
    now: phaseFixture.now,
  });
  const incompletePlayerCount =
    confidence.counts.stale + confidence.counts.missing + confidence.counts.disconnected;
  const primaryAction = selectPrimaryAction({
    dataConfidence: confidence.dataConfidence,
    incompletePlayerCount,
    briefingAvailable: phaseResult.phase === "briefing",
    caseResultAvailable: phaseResult.phase === "case_closed",
    phase: phaseResult.phase,
    suddenDeathActive: phaseFixture.suddenDeathActive,
    specialOperationActive: controls.platformSweepBonus > 0,
    predictionActionAvailable: !controls.predictionSubmitted,
    fieldOpsNearReward: controls.fieldOpsAverageLines > 0 && controls.fieldOpsAverageLines < 3,
    nemesisClose: controls.nemesisMode === "partial",
    dailyTargetWithinReach: controls.baseProgress > 0.75 && controls.baseProgress < 1,
  });

  return {
    seasonState: {
      season: {
        id: SEASON_ONE_CONFIG.id,
        title: SEASON_ONE_CONFIG.title,
        weekNumber: WEEK_ONE_CHICAGO.weekNumber,
        totalWeeks: SEASON_ONE_CONFIG.route.length,
      },
      chapter: {
        city: WEEK_ONE_CHICAGO.cityName,
        title: WEEK_ONE_CHICAGO.chapterTitle,
        complication: WEEK_ONE_CHICAGO.complication.label,
        nextCity: WEEK_ONE_CHICAGO.nextCityTeaser.cityName,
      },
      phase: phaseResult.phase,
      dataConfidence: confidence.dataConfidence,
      chase,
      primaryAction,
      sync: {
        lastUpdatedAt: confidence.dataConfidence === "incomplete" ? null : "2026-06-12T18:50:00.000Z",
        incompletePlayerCount,
        stalePlayerCount: confidence.counts.stale,
      },
    },
    platformSweep: {
      label: WEEK_ONE_CHICAGO.specialOperation.label,
      placeholder: true,
      earnedBonus: controls.platformSweepBonus,
      contributors: controls.platformSweepBonus === 0 ? 0 : Math.ceil(ACTIVE_PLAYERS * 0.6),
      eligiblePlayers: ACTIVE_PLAYERS,
    },
    ritualFlags: {
      suddenDeathActive: phaseFixture.suddenDeathActive,
      predictionSubmitted: controls.predictionSubmitted,
      briefingViewed: phaseFixture.briefingViewed,
    },
  };
}

function splitStepsAcrossPlayers(verifiedGroupSteps: number) {
  const base = Math.floor(verifiedGroupSteps / ACTIVE_PLAYERS);
  return Array.from({ length: ACTIVE_PLAYERS }, (_, index) => ({
    userId: `sim-player-${index + 1}`,
    weeklyTarget: GROUP_TARGET / ACTIVE_PLAYERS,
    stepsThisWeek: index === 0 ? base + (verifiedGroupSteps - (base * ACTIVE_PLAYERS)) : base,
    lastSyncedAt: new Date("2026-06-12T18:50:00.000Z"),
    fitbitConnected: true,
  }));
}

function trackerSyncForConfidence(dataConfidence: DataConfidence): TrackerSyncState[] {
  switch (dataConfidence) {
    case "verified":
      return currentTrackers();
    case "estimated":
      return [
        ...currentTrackers().slice(0, 3),
        { userId: "sim-player-4", freshness: "delayed" },
      ];
    case "incomplete":
      return [
        { userId: "sim-player-1", freshness: "current" },
        { userId: "sim-player-2", freshness: "current" },
        { userId: "sim-player-3", freshness: "stale" },
        { userId: "sim-player-4", freshness: "missing" },
      ];
    case "recalculating":
      return currentTrackers();
  }
}

function currentTrackers(): TrackerSyncState[] {
  return Array.from({ length: ACTIVE_PLAYERS }, (_, index) => ({
    userId: `sim-player-${index + 1}`,
    freshness: "current",
  }));
}

function nemesisForMode(mode: WeekSimulatorControls["nemesisMode"]) {
  if (mode === "complete") {
    return { activePlayerCount: ACTIVE_PLAYERS, participantsWithActivity: ACTIVE_PLAYERS, allMatchupsResolved: true };
  }
  if (mode === "partial") {
    return { activePlayerCount: ACTIVE_PLAYERS, participantsWithActivity: 3, allMatchupsResolved: false };
  }
  return { activePlayerCount: ACTIVE_PLAYERS, participantsWithActivity: 0, allMatchupsResolved: false };
}

function fixtureForPhase(phase: WeekPhase, outcome: WeeklyOutcome, dataConfidence: DataConfidence) {
  switch (phase) {
    case "briefing":
      return phaseFixture("2026-06-08T15:00:00.000Z", 0.08, "active", false, true, true, false);
    case "active":
      return phaseFixture("2026-06-09T15:00:00.000Z", 0.22, "active", true, true, true, false);
    case "midweek_update":
      return phaseFixture("2026-06-10T17:00:00.000Z", 0.36, "active", true, false, true, false);
    case "final_push":
      return phaseFixture("2026-06-12T14:00:00.000Z", 0.65, "active", true, true, false, false);
    case "sudden_death":
      return phaseFixture("2026-06-13T18:00:00.000Z", 0.78, "active", true, true, true, true);
    case "case_closing":
      return phaseFixture("2026-06-15T04:59:00.000Z", 1, "active", true, true, true, false);
    case "case_closed":
      return {
        ...phaseFixture("2026-06-15T06:00:00.000Z", 1, "closed", true, true, true, false),
        finalOutcome: outcome,
        dataConfidence,
      };
  }
}

function phaseFixture(
  iso: string,
  elapsedFractionOfWeek: number,
  weekStatus: "active" | "closed",
  briefingViewed: boolean,
  midweekViewed: boolean,
  finalPushViewed: boolean,
  suddenDeathActive: boolean,
) {
  return {
    now: new Date(iso),
    elapsedFractionOfWeek,
    weekStatus,
    briefingViewed,
    midweekViewed,
    finalPushViewed,
    suddenDeathActive,
  };
}
