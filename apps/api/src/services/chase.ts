import type { DataConfidence, WeeklyOutcome } from "@one-step-ahead/shared";
import { calculateDataConfidenceFromFreshness, type TrackerSyncState } from "./dataConfidence.js";

export interface ActivePlayerInput {
  userId: string;
  weeklyTarget: number;
  stepsThisWeek: number;
  lastSyncedAt: Date | null;
  fitbitConnected: boolean;
}

export interface FieldOpsGroupState {
  activePlayerCount: number;
  totalQualifyingLines: number;
}

export interface SpecialOperationState {
  maxBonus: number;
  earnedBonus: number;
  contributors: number;
  eligiblePlayers: number;
}

export interface NemesisGroupState {
  activePlayerCount: number;
  participantsWithActivity: number;
  allMatchupsResolved: boolean;
}

export interface PredictionGroupState {
  activePlayerCount: number;
  submittedCount: number;
}

export interface ChaseCalculationInput {
  activePlayers: ActivePlayerInput[];
  fieldOps: FieldOpsGroupState;
  specialOperation: SpecialOperationState;
  nemesis: NemesisGroupState;
  prediction: PredictionGroupState;
  trackerSync: TrackerSyncState[];
  elapsedFractionOfWeek: number;
  now: Date;
  groupWeeklyTargetSnapshot?: number;
  dataConfidence?: DataConfidence;
  final?: boolean;
}

export interface ChaseCalculationResult {
  groupWeeklyTarget: number;
  verifiedGroupSteps: number;
  baseProgress: number;
  bonuses: {
    fieldOps: number;
    specialOperation: number;
    nemesisParticipation: number;
    predictionParticipation: number;
    total: number;
  };
  finalProgress: number;
  remainingLead: number;
  projectedOutcome: WeeklyOutcome | null;
  finalOutcome: WeeklyOutcome | null;
  dataConfidence: DataConfidence;
}

const FIELD_OPS_MAX = 0.05;
const SPECIAL_OPERATION_MAX = 0.03;
const NEMESIS_MAX = 0.01;
const PREDICTION_MAX = 0.01;
const TOTAL_NON_STEP_BONUS_MAX = 0.1;
const MIN_ELAPSED_FOR_PROJECTION = 1 / 7;

export function classifyWeeklyOutcome(progress: number): WeeklyOutcome {
  if (!Number.isFinite(progress) || progress < 0.7) return "trail_lost";
  if (progress < 0.9) return "pursuit_maintained";
  if (progress < 1) return "close_encounter";
  return "interception";
}

export function calculateFieldOpsBonus(fieldOps: FieldOpsGroupState): number {
  const activePlayerCount = positiveNumber(fieldOps.activePlayerCount);
  if (activePlayerCount <= 0) return 0;

  const averageLines = Math.max(0, safeNumber(fieldOps.totalQualifyingLines)) / activePlayerCount;
  if (averageLines >= 3) return FIELD_OPS_MAX;
  if (averageLines >= 2) return 0.035;
  if (averageLines >= 1) return 0.02;
  return 0;
}

export function calculateSpecialOperationBonus(specialOperation: SpecialOperationState): number {
  const maxBonus = clamp(safeNumber(specialOperation.maxBonus), 0, SPECIAL_OPERATION_MAX);
  return clamp(safeNumber(specialOperation.earnedBonus), 0, maxBonus);
}

export function calculateNemesisParticipationBonus(nemesis: NemesisGroupState): number {
  const activePlayerCount = positiveNumber(nemesis.activePlayerCount);
  if (activePlayerCount <= 0) return 0;

  let bonus = 0;
  const participationRatio = Math.max(0, safeNumber(nemesis.participantsWithActivity)) / activePlayerCount;
  if (participationRatio >= 0.7) bonus += 0.005;
  if (nemesis.allMatchupsResolved) bonus += 0.005;

  return clamp(bonus, 0, NEMESIS_MAX);
}

export function calculatePredictionParticipationBonus(prediction: PredictionGroupState): number {
  const activePlayerCount = positiveNumber(prediction.activePlayerCount);
  if (activePlayerCount <= 0) return 0;

  const submittedCount = Math.max(0, safeNumber(prediction.submittedCount));
  const participationRatio = submittedCount / activePlayerCount;
  if (submittedCount >= activePlayerCount) return PREDICTION_MAX;
  if (participationRatio >= 0.7) return 0.005;
  return 0;
}

export function calculateChase(input: ChaseCalculationInput): ChaseCalculationResult {
  const groupWeeklyTarget = resolveGroupTarget(input);
  const verifiedGroupSteps = input.activePlayers.reduce(
    (total, player) => total + Math.max(0, safeNumber(player.stepsThisWeek)),
    0,
  );
  const baseProgress = groupWeeklyTarget > 0 ? verifiedGroupSteps / groupWeeklyTarget : 0;

  const fieldOps = calculateFieldOpsBonus(input.fieldOps);
  const specialOperation = calculateSpecialOperationBonus(input.specialOperation);
  const nemesisParticipation = calculateNemesisParticipationBonus(input.nemesis);
  const predictionParticipation = calculatePredictionParticipationBonus(input.prediction);
  const total = roundBonus(clamp(
    fieldOps + specialOperation + nemesisParticipation + predictionParticipation,
    0,
    TOTAL_NON_STEP_BONUS_MAX,
  ));

  const finalProgress = baseProgress + total;
  const remainingLead = groupWeeklyTarget > 0
    ? Math.max(0, Math.round(groupWeeklyTarget * (1 - finalProgress)))
    : 0;
  const dataConfidence = input.dataConfidence
    ?? calculateDataConfidenceFromFreshness({ trackerSync: input.trackerSync }).dataConfidence;
  const projectedProgress = calculateProjectedProgress({
    baseProgress,
    elapsedFractionOfWeek: input.elapsedFractionOfWeek,
    totalBonus: total,
  });
  const canProject = groupWeeklyTarget > 0
    && safeNumber(input.elapsedFractionOfWeek) >= MIN_ELAPSED_FOR_PROJECTION
    && dataConfidence !== "incomplete"
    && dataConfidence !== "recalculating";

  return {
    groupWeeklyTarget,
    verifiedGroupSteps,
    baseProgress,
    bonuses: {
      fieldOps,
      specialOperation,
      nemesisParticipation,
      predictionParticipation,
      total,
    },
    finalProgress,
    remainingLead,
    projectedOutcome: canProject ? classifyWeeklyOutcome(projectedProgress) : null,
    finalOutcome: input.final === true && groupWeeklyTarget > 0 ? classifyWeeklyOutcome(finalProgress) : null,
    dataConfidence,
  };
}

function resolveGroupTarget(input: ChaseCalculationInput): number {
  const snapshot = safeNumber(input.groupWeeklyTargetSnapshot);
  if (snapshot > 0) return snapshot;

  const summedTargets = input.activePlayers.reduce(
    (total, player) => total + Math.max(0, safeNumber(player.weeklyTarget)),
    0,
  );
  return summedTargets > 0 ? summedTargets : 0;
}

function calculateProjectedProgress(input: {
  baseProgress: number;
  elapsedFractionOfWeek: number;
  totalBonus: number;
}): number {
  const elapsed = clamp(safeNumber(input.elapsedFractionOfWeek), MIN_ELAPSED_FOR_PROJECTION, 1);
  return (input.baseProgress / elapsed) + input.totalBonus;
}

function safeNumber(value: number | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function positiveNumber(value: number): number {
  return Math.max(0, safeNumber(value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundBonus(value: number): number {
  return Math.round(value * 10000) / 10000;
}
