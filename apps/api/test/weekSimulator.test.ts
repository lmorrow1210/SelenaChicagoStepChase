import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEEK_SIMULATOR_CONTROLS,
  WEEK_SIMULATOR_CONFIDENCE,
  WEEK_SIMULATOR_OUTCOMES,
  WEEK_SIMULATOR_PHASES,
  buildWeekSimulatorState,
  progressForOutcome,
} from "../../web/lib/weekSimulator.js";

describe("Week Simulator", () => {
  it("uses the production Week 1 Season One config", () => {
    const state = buildWeekSimulatorState(DEFAULT_WEEK_SIMULATOR_CONTROLS);

    expect(state.seasonState.season).toMatchObject({
      id: "season_one",
      title: "The Lakefront Job",
      weekNumber: 1,
      totalWeeks: 13,
    });
    expect(state.seasonState.chapter).toMatchObject({
      city: "Chicago",
      title: "The Lakefront Job",
      nextCity: "Detroit",
    });
  });

  it("can switch through every Week 1 phase with the real phase calculator", () => {
    for (const phase of WEEK_SIMULATOR_PHASES) {
      const state = buildWeekSimulatorState({ ...DEFAULT_WEEK_SIMULATOR_CONTROLS, phase });
      expect(state.seasonState.phase).toBe(phase);
    }
  });

  it("can switch through all four weekly outcomes", () => {
    for (const outcome of WEEK_SIMULATOR_OUTCOMES) {
      const state = buildWeekSimulatorState({
        ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
        phase: "case_closed",
        outcome,
        baseProgress: progressForOutcome(outcome),
      });
      expect(state.seasonState.chase.finalOutcome).toBe(outcome);
    }
  });

  it("can switch through all four data-confidence states", () => {
    for (const dataConfidence of WEEK_SIMULATOR_CONFIDENCE) {
      const state = buildWeekSimulatorState({ ...DEFAULT_WEEK_SIMULATOR_CONTROLS, dataConfidence });
      expect(state.seasonState.dataConfidence).toBe(dataConfidence);
    }
  });

  it("exposes chase bonuses, sudden death, prediction, and Platform Sweep placeholders", () => {
    const state = buildWeekSimulatorState({
      ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
      phase: "sudden_death",
      fieldOpsAverageLines: 3,
      platformSweepBonus: 0.03,
      nemesisMode: "complete",
      predictionSubmitted: true,
    });

    expect(state.ritualFlags.suddenDeathActive).toBe(true);
    expect(state.ritualFlags.predictionSubmitted).toBe(true);
    expect(state.platformSweep).toMatchObject({
      placeholder: true,
      earnedBonus: 0.03,
    });
    expect(state.seasonState.chase.bonuses).toMatchObject({
      fieldOps: 0.05,
      specialOperation: 0.03,
      nemesisParticipation: 0.01,
      predictionParticipation: 0.01,
      total: 0.1,
    });
  });

  it("drives the primary action selector from simulator controls", () => {
    const incomplete = buildWeekSimulatorState({
      ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
      dataConfidence: "incomplete",
    });
    const briefing = buildWeekSimulatorState({
      ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
      phase: "briefing",
      predictionSubmitted: true,
    });

    expect(incomplete.seasonState.primaryAction.id).toBe("fix_sync");
    expect(briefing.seasonState.primaryAction.id).toBe("view_briefing");
  });
});
