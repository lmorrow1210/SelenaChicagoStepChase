import { describe, expect, it } from "vitest";
import { WEEK_ONE_CHICAGO } from "@one-step-ahead/shared/season-one/seasonOne";
import { selectPrimaryBeat, type PrimaryBeatInput } from "@one-step-ahead/shared/season-one/primaryBeat";

function input(overrides: Partial<PrimaryBeatInput> = {}): PrimaryBeatInput {
  return {
    weekConfig: WEEK_ONE_CHICAGO,
    phase: "active",
    dataConfidence: "verified",
    projectedOutcome: null,
    finalOutcome: null,
    remainingLead: 42000,
    firstLineComplete: false,
    platformSweepActive: false,
    platformSweepEarnedBonus: 0,
    platformSweepMaxBonus: 0.03,
    ...overrides,
  };
}

describe("primary beat selection", () => {
  it("trust beats override everything, including ritual phases", () => {
    const beat = selectPrimaryBeat(input({ phase: "midweek_update", dataConfidence: "incomplete" }));
    expect(beat.id).toBe("group_data_incomplete");
    expect(beat.category).toBe("trust");
    expect(beat.selena).toBeUndefined();

    const recalc = selectPrimaryBeat(input({ phase: "final_push", dataConfidence: "recalculating" }));
    expect(recalc.id).toBe("result_recalculating");
  });

  it("ritual beats override field ops and pursuit beats", () => {
    const beat = selectPrimaryBeat(input({
      phase: "sudden_death",
      firstLineComplete: true,
      platformSweepActive: true,
    }));
    expect(beat.id).toBe("sudden_death");
    expect(beat.headline).toBe("SUDDEN DEATH");
  });

  it("selects the midweek variant by projected pace", () => {
    const strong = selectPrimaryBeat(input({ phase: "midweek_update", projectedOutcome: "interception" }));
    expect(strong.headline).toBe("THE GAP IS CLOSING");
    expect(strong.selena).toContain("watching the right train");

    const cooling = selectPrimaryBeat(input({ phase: "midweek_update", projectedOutcome: "trail_lost" }));
    expect(cooling.headline).toBe("THE TRAIL IS COOLING");
  });

  it("withholds Selena commentary when data is only estimated", () => {
    const beat = selectPrimaryBeat(input({
      phase: "midweek_update",
      dataConfidence: "estimated",
      projectedOutcome: "interception",
    }));
    expect(beat.headline).toBe("THE GAP IS CLOSING");
    expect(beat.selena).toBeUndefined();
  });

  it("uses outcome-specific copy on case close, gated on confidence", () => {
    const verified = selectPrimaryBeat(input({ phase: "case_closed", finalOutcome: "interception" }));
    expect(verified.headline).toBe("SELENA INTERCEPTED");
    expect(verified.selena).toBe(WEEK_ONE_CHICAGO.closeCopy.interception.selena);

    const estimated = selectPrimaryBeat(input({
      phase: "case_closed",
      finalOutcome: "interception",
      dataConfidence: "estimated",
    }));
    expect(estimated.selena).toBeUndefined();
  });

  it("surfaces Platform Sweep and first-line beats during the active phase", () => {
    const started = selectPrimaryBeat(input({ platformSweepActive: true }));
    expect(started.id).toBe("platform_sweep_started");
    expect(started.body).toBe(WEEK_ONE_CHICAGO.rituals.specialOperationFiction);

    const completed = selectPrimaryBeat(input({
      platformSweepActive: true,
      platformSweepEarnedBonus: 0.03,
    }));
    expect(completed.id).toBe("platform_sweep_completed");

    const line = selectPrimaryBeat(input({ firstLineComplete: true }));
    expect(line.id).toBe("first_field_ops_line");
    expect(line.body).toBe(WEEK_ONE_CHICAGO.fieldOps.firstLinePayoff);
  });

  it("falls back to a neutral field report", () => {
    const beat = selectPrimaryBeat(input());
    expect(beat.id).toBe("field_report");
    expect(beat.body).toContain("Chicago");
  });
});
