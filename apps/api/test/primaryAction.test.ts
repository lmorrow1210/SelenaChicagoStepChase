import { describe, expect, it } from "vitest";
import { selectPrimaryAction, type PrimaryActionInput } from "../src/services/primaryAction.js";

const baseInput = (): PrimaryActionInput => ({
  dataConfidence: "verified",
  incompletePlayerCount: 0,
  briefingAvailable: false,
  caseResultAvailable: false,
  phase: "active",
  suddenDeathActive: false,
  specialOperationActive: false,
  predictionActionAvailable: false,
  fieldOpsNearReward: false,
  nemesisClose: false,
  dailyTargetWithinReach: false,
});

describe("selectPrimaryAction", () => {
  it("uses deterministic priority order", () => {
    const input = {
      ...baseInput(),
      dataConfidence: "incomplete" as const,
      incompletePlayerCount: 1,
      suddenDeathActive: true,
      predictionActionAvailable: true,
      dailyTargetWithinReach: true,
    };

    expect(selectPrimaryAction(input)).toMatchObject({ id: "fix_sync", priority: 1 });
    expect(selectPrimaryAction({ ...input, dataConfidence: "verified", incompletePlayerCount: 0 })).toMatchObject({
      id: "sudden_death",
      priority: 4,
    });
  });

  it("returns the first supported action and falls back to continue pursuit", () => {
    expect(selectPrimaryAction({ ...baseInput(), briefingAvailable: true }).id).toBe("view_briefing");
    expect(selectPrimaryAction({ ...baseInput(), caseResultAvailable: true }).id).toBe("view_case_result");
    expect(selectPrimaryAction({ ...baseInput(), specialOperationActive: true }).id).toBe("special_operation");
    expect(selectPrimaryAction({ ...baseInput(), predictionActionAvailable: true }).id).toBe("submit_prediction");
    expect(selectPrimaryAction({ ...baseInput(), fieldOpsNearReward: true }).id).toBe("field_ops_near_reward");
    expect(selectPrimaryAction({ ...baseInput(), nemesisClose: true }).id).toBe("nemesis_close");
    expect(selectPrimaryAction({ ...baseInput(), dailyTargetWithinReach: true }).id).toBe("daily_target");
    expect(selectPrimaryAction(baseInput()).id).toBe("continue_pursuit");
  });
});
