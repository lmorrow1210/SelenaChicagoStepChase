import { describe, expect, it } from "vitest";
import { WEEK_ONE_CHICAGO } from "@one-step-ahead/shared/season-one/seasonOne";
import {
  calculateParticipationThreshold,
  operationWindowDates,
} from "@one-step-ahead/shared/season-one/specialOperations";

const config = WEEK_ONE_CHICAGO.specialOperation;

describe("Platform Sweep participation-threshold math", () => {
  it("earns nothing below the 40% tier", () => {
    const state = calculateParticipationThreshold(config, {
      contributors: 1,
      eligiblePlayers: 4,
      active: true,
    });
    expect(state.earnedBonus).toBe(0);
    expect(state.nextThresholdCount).toBe(2); // ceil(0.4 × 4)
  });

  it("maps the 40/60/80 tiers to +1/+2/+3%", () => {
    const at = (contributors: number, eligiblePlayers: number) =>
      calculateParticipationThreshold(config, { contributors, eligiblePlayers, active: true }).earnedBonus;
    expect(at(2, 5)).toBe(0.01); // 40%
    expect(at(3, 5)).toBe(0.02); // 60%
    expect(at(4, 5)).toBe(0.03); // 80%
    expect(at(5, 5)).toBe(0.03); // capped at the top tier
  });

  it("handles odd group sizes with ceil-based next thresholds", () => {
    const state = calculateParticipationThreshold(config, {
      contributors: 1,
      eligiblePlayers: 3,
      active: true,
    });
    // 1/3 = 33% < 40%; next tier needs ceil(0.4 × 3) = 2 contributors.
    expect(state.earnedBonus).toBe(0);
    expect(state.nextThresholdCount).toBe(2);

    const two = calculateParticipationThreshold(config, {
      contributors: 2,
      eligiblePlayers: 3,
      active: true,
    });
    // 2/3 = 66.7% clears both the 40% and 60% tiers.
    expect(two.earnedBonus).toBe(0.02);
    expect(two.nextThresholdCount).toBe(3);
  });

  it("earns the top tier and reports no further threshold", () => {
    const state = calculateParticipationThreshold(config, {
      contributors: 4,
      eligiblePlayers: 4,
      active: false,
    });
    expect(state.earnedBonus).toBe(0.03);
    expect(state.maxBonus).toBe(0.03);
    expect(state.nextThresholdCount).toBeNull();
    expect(state.active).toBe(false);
  });

  it("returns zero for an empty group and clamps contributors", () => {
    const empty = calculateParticipationThreshold(config, {
      contributors: 3,
      eligiblePlayers: 0,
      active: true,
    });
    expect(empty.earnedBonus).toBe(0);
    expect(empty.contributors).toBe(0);
    expect(empty.nextThresholdCount).toBeNull();

    const clamped = calculateParticipationThreshold(config, {
      contributors: 9,
      eligiblePlayers: 4,
      active: true,
    });
    expect(clamped.contributors).toBe(4);
  });

  it("resolves the Friday+Saturday window from the week start", () => {
    expect(operationWindowDates(config, "2026-06-08")).toEqual(["2026-06-12", "2026-06-13"]);
  });
});
