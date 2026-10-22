import { describe, expect, it } from "vitest";
import {
  calculateChase,
  calculateFieldOpsBonus,
  calculateNemesisParticipationBonus,
  calculatePredictionParticipationBonus,
  calculateSpecialOperationBonus,
  classifyWeeklyOutcome,
  type ChaseCalculationInput,
} from "@one-step-ahead/shared/season-one/chase";

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

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function randomInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function fuzzInput(seed: number): ChaseCalculationInput {
  const rand = seededRandom(seed);
  const playerCount = randomInt(rand, 1, 12);
  const activePlayers = Array.from({ length: playerCount }, (_, index) => ({
    userId: `player-${index}`,
    weeklyTarget: randomInt(rand, 35_000, 140_000),
    stepsThisWeek: randomInt(rand, 0, 220_000),
    lastSyncedAt: new Date("2026-06-10T12:00:00Z"),
    fitbitConnected: true,
  }));
  const groupWeeklyTargetSnapshot = activePlayers.reduce((sum, player) => sum + player.weeklyTarget, 0);

  return {
    activePlayers,
    fieldOps: {
      activePlayerCount: playerCount,
      totalQualifyingLines: randomInt(rand, 0, playerCount * 8),
    },
    specialOperation: {
      maxBonus: rand() * 0.5,
      earnedBonus: rand() * 0.5,
      contributors: randomInt(rand, 0, playerCount),
      eligiblePlayers: playerCount,
    },
    nemesis: {
      activePlayerCount: playerCount,
      participantsWithActivity: randomInt(rand, 0, playerCount * 2),
      allMatchupsResolved: rand() > 0.5,
    },
    prediction: {
      activePlayerCount: playerCount,
      submittedCount: randomInt(rand, 0, playerCount * 2),
    },
    trackerSync: activePlayers.map((player) => ({ userId: player.userId, freshness: "current" })),
    elapsedFractionOfWeek: rand(),
    now: new Date("2026-06-10T12:00:00Z"),
    groupWeeklyTargetSnapshot,
    final: true,
  };
}

function noBonusProgressInput(progress: number, dataConfidence = "verified" as const): ChaseCalculationInput {
  const target = 100_000;
  return {
    activePlayers: [
      {
        userId: "a",
        weeklyTarget: target,
        stepsThisWeek: Math.round(target * progress),
        lastSyncedAt: new Date("2026-06-10T12:00:00Z"),
        fitbitConnected: true,
      },
    ],
    fieldOps: { activePlayerCount: 1, totalQualifyingLines: 0 },
    specialOperation: { maxBonus: 0.03, earnedBonus: 0, contributors: 0, eligiblePlayers: 1 },
    nemesis: { activePlayerCount: 1, participantsWithActivity: 0, allMatchupsResolved: false },
    prediction: { activePlayerCount: 1, submittedCount: 0 },
    trackerSync: [{ userId: "a", freshness: "current" }],
    elapsedFractionOfWeek: 1,
    now: new Date("2026-06-10T12:00:00Z"),
    groupWeeklyTargetSnapshot: target,
    dataConfidence,
    final: true,
  };
}

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

  it("keeps final progress monotonic as verified steps increase", () => {
    for (let seed = 1; seed <= 250; seed++) {
      const input = fuzzInput(seed);
      const before = calculateChase(input);
      const boosted = {
        ...input,
        activePlayers: input.activePlayers.map((player, index) =>
          index === 0
            ? { ...player, stepsThisWeek: player.stepsThisWeek + 10_000 }
            : player,
        ),
      };
      const after = calculateChase(boosted);

      expect(after.finalProgress).toBeGreaterThanOrEqual(before.finalProgress);
    }
  });

  it("keeps randomized bonuses capped and remaining lead non-negative", () => {
    for (let seed = 1; seed <= 250; seed++) {
      const result = calculateChase(fuzzInput(seed));

      expect(result.bonuses.fieldOps).toBeGreaterThanOrEqual(0);
      expect(result.bonuses.fieldOps).toBeLessThanOrEqual(0.05);
      expect(result.bonuses.specialOperation).toBeGreaterThanOrEqual(0);
      expect(result.bonuses.specialOperation).toBeLessThanOrEqual(0.03);
      expect(result.bonuses.nemesisParticipation).toBeGreaterThanOrEqual(0);
      expect(result.bonuses.nemesisParticipation).toBeLessThanOrEqual(0.01);
      expect(result.bonuses.predictionParticipation).toBeGreaterThanOrEqual(0);
      expect(result.bonuses.predictionParticipation).toBeLessThanOrEqual(0.01);
      expect(result.bonuses.total).toBeLessThanOrEqual(0.1);
      expect(result.remainingLead).toBeGreaterThanOrEqual(0);
    }
  });

  it("classifies exact calculateChase final boundaries at 70, 90, and 100 percent", () => {
    expect(calculateChase(noBonusProgressInput(0.69999)).finalOutcome).toBe("trail_lost");
    expect(calculateChase(noBonusProgressInput(0.7)).finalOutcome).toBe("pursuit_maintained");
    expect(calculateChase(noBonusProgressInput(0.89999)).finalOutcome).toBe("pursuit_maintained");
    expect(calculateChase(noBonusProgressInput(0.9)).finalOutcome).toBe("close_encounter");
    expect(calculateChase(noBonusProgressInput(0.99999)).finalOutcome).toBe("close_encounter");
    expect(calculateChase(noBonusProgressInput(1)).finalOutcome).toBe("interception");
  });

  it("withholds projections while data confidence is incomplete or recalculating", () => {
    expect(calculateChase(noBonusProgressInput(1, "verified")).projectedOutcome).toBe("interception");
    expect(calculateChase(noBonusProgressInput(1, "estimated")).projectedOutcome).toBe("interception");
    expect(calculateChase(noBonusProgressInput(1, "incomplete")).projectedOutcome).toBeNull();
    expect(calculateChase(noBonusProgressInput(1, "recalculating")).projectedOutcome).toBeNull();
  });
});
