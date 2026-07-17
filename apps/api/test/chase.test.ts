import { describe, expect, it } from "vitest";
import {
  calculateChase,
  calculateFieldOpsBonus,
  calculateNemesisParticipationBonus,
  calculatePredictionParticipationBonus,
  calculateSpecialOperationBonus,
  classifyWeeklyOutcome,
  type ChaseCalculationInput,
} from "../src/services/chase.js";

const baseInput = (): ChaseCalculationInput => ({
  activePlayers: [
    { userId: "a", weeklyTarget: 100000, stepsThisWeek: 50000, lastSyncedAt: null, fitbitConnected: true },
    { userId: "b", weeklyTarget: 100000, stepsThisWeek: 25000, lastSyncedAt: null, fitbitConnected: true },
  ],
  fieldOps: { activePlayerCount: 2, totalQualifyingLines: 0 },
  specialOperation: { maxBonus: 0.03, earnedBonus: 0, contributors: 0, eligiblePlayers: 2 },
  nemesis: { activePlayerCount: 2, participantsWithActivity: 0, allMatchupsResolved: false },
  prediction: { activePlayerCount: 2, submittedCount: 0 },
  trackerSync: [
    { userId: "a", freshness: "current" },
    { userId: "b", freshness: "current" },
  ],
  elapsedFractionOfWeek: 0.5,
  now: new Date("2026-06-10T12:00:00Z"),
  groupWeeklyTargetSnapshot: 200000,
});

describe("classifyWeeklyOutcome", () => {
  it("covers every weekly-outcome boundary", () => {
    expect(classifyWeeklyOutcome(0)).toBe("trail_lost");
    expect(classifyWeeklyOutcome(0.6999)).toBe("trail_lost");
    expect(classifyWeeklyOutcome(0.7)).toBe("pursuit_maintained");
    expect(classifyWeeklyOutcome(0.8999)).toBe("pursuit_maintained");
    expect(classifyWeeklyOutcome(0.9)).toBe("close_encounter");
    expect(classifyWeeklyOutcome(0.9999)).toBe("close_encounter");
    expect(classifyWeeklyOutcome(1)).toBe("interception");
    expect(classifyWeeklyOutcome(1.25)).toBe("interception");
  });
});

describe("bonus calculations", () => {
  it("caps Field Ops bonus at 5 percent", () => {
    expect(calculateFieldOpsBonus({ activePlayerCount: 4, totalQualifyingLines: 3 })).toBe(0);
    expect(calculateFieldOpsBonus({ activePlayerCount: 4, totalQualifyingLines: 4 })).toBe(0.02);
    expect(calculateFieldOpsBonus({ activePlayerCount: 4, totalQualifyingLines: 8 })).toBe(0.035);
    expect(calculateFieldOpsBonus({ activePlayerCount: 4, totalQualifyingLines: 12 })).toBe(0.05);
    expect(calculateFieldOpsBonus({ activePlayerCount: 4, totalQualifyingLines: 99 })).toBe(0.05);
  });

  it("caps special-operation, nemesis, and prediction participation bonuses", () => {
    expect(calculateSpecialOperationBonus({ maxBonus: 0.03, earnedBonus: 0.02, contributors: 2, eligiblePlayers: 4 })).toBe(0.02);
    expect(calculateSpecialOperationBonus({ maxBonus: 0.5, earnedBonus: 0.5, contributors: 4, eligiblePlayers: 4 })).toBe(0.03);
    expect(calculateNemesisParticipationBonus({ activePlayerCount: 10, participantsWithActivity: 6, allMatchupsResolved: false })).toBe(0);
    expect(calculateNemesisParticipationBonus({ activePlayerCount: 10, participantsWithActivity: 7, allMatchupsResolved: false })).toBe(0.005);
    expect(calculateNemesisParticipationBonus({ activePlayerCount: 10, participantsWithActivity: 10, allMatchupsResolved: true })).toBe(0.01);
    expect(calculatePredictionParticipationBonus({ activePlayerCount: 10, submittedCount: 7 })).toBe(0.005);
    expect(calculatePredictionParticipationBonus({ activePlayerCount: 10, submittedCount: 99 })).toBe(0.01);
  });

  it("caps the total non-step bonus at 10 percentage points", () => {
    const result = calculateChase({
      ...baseInput(),
      fieldOps: { activePlayerCount: 1, totalQualifyingLines: 99 },
      specialOperation: { maxBonus: 0.5, earnedBonus: 0.5, contributors: 1, eligiblePlayers: 1 },
      nemesis: { activePlayerCount: 1, participantsWithActivity: 1, allMatchupsResolved: true },
      prediction: { activePlayerCount: 1, submittedCount: 99 },
    });

    expect(result.bonuses).toMatchObject({
      fieldOps: 0.05,
      specialOperation: 0.03,
      nemesisParticipation: 0.01,
      predictionParticipation: 0.01,
      total: 0.1,
    });
  });
});

describe("calculateChase", () => {
  it("uses verified group steps and the snapshotted group target", () => {
    const result = calculateChase(baseInput());

    expect(result.groupWeeklyTarget).toBe(200000);
    expect(result.verifiedGroupSteps).toBe(75000);
    expect(result.baseProgress).toBe(0.375);
    expect(result.finalProgress).toBe(0.375);
    expect(result.remainingLead).toBe(125000);
  });

  it("allows remaining lead to reach zero and never go below zero", () => {
    const result = calculateChase({
      ...baseInput(),
      activePlayers: [
        { userId: "a", weeklyTarget: 100000, stepsThisWeek: 250000, lastSyncedAt: null, fitbitConnected: true },
      ],
      groupWeeklyTargetSnapshot: 100000,
      final: true,
    });

    expect(result.remainingLead).toBe(0);
    expect(result.finalOutcome).toBe("interception");
  });

  it("protects against zero and invalid target values", () => {
    const zeroTarget = calculateChase({ ...baseInput(), groupWeeklyTargetSnapshot: 0, activePlayers: [] });
    const invalidTarget = calculateChase({
      ...baseInput(),
      groupWeeklyTargetSnapshot: Number.NaN,
      activePlayers: [{ userId: "a", weeklyTarget: Number.NaN, stepsThisWeek: 100, lastSyncedAt: null, fitbitConnected: true }],
      final: true,
    });

    expect(zeroTarget.groupWeeklyTarget).toBe(0);
    expect(zeroTarget.baseProgress).toBe(0);
    expect(zeroTarget.remainingLead).toBe(0);
    expect(zeroTarget.finalOutcome).toBeNull();
    expect(invalidTarget.groupWeeklyTarget).toBe(0);
    expect(invalidTarget.finalOutcome).toBeNull();
  });

  it("returns projected and final weekly outcomes only when eligible", () => {
    expect(calculateChase({ ...baseInput(), elapsedFractionOfWeek: 0.1 }).projectedOutcome).toBeNull();
    expect(calculateChase({ ...baseInput(), dataConfidence: "incomplete" }).projectedOutcome).toBeNull();
    expect(calculateChase({ ...baseInput(), activePlayers: [{ ...baseInput().activePlayers[0], stepsThisWeek: 100000 }] }).projectedOutcome).toBe("interception");
    expect(calculateChase({ ...baseInput(), final: true }).finalOutcome).toBe("trail_lost");
  });

  it("does not mutate calculator inputs", () => {
    const input = baseInput();
    const before = JSON.stringify(input);

    calculateChase(input);

    expect(JSON.stringify(input)).toBe(before);
  });
});
