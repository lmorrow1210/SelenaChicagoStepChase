import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEEK_SIMULATOR_CONTROLS,
  WEEK_SIMULATOR_CONFIDENCE,
  WEEK_SIMULATOR_OUTCOMES,
  WEEK_SIMULATOR_PHASES,
  WEEK_SIMULATOR_WEEKS,
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

  it("can preview every Season One week without hard-coded Week 1 evidence", () => {
    for (const week of WEEK_SIMULATOR_WEEKS) {
      const state = buildWeekSimulatorState({
        ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
        weekNumber: week.weekNumber,
        outcome: "interception",
        evidenceUnlocked: true,
        interceptUnlocked: true,
      });
      const selectedBoardWeek = state.evidenceBoard.weeks[week.weekNumber - 1];

      expect(state.seasonState.season.weekNumber).toBe(week.weekNumber);
      expect(state.seasonState.chapter).toMatchObject({
        city: week.cityName,
        title: week.chapterTitle,
      });
      expect(selectedBoardWeek).toMatchObject({
        weekNumber: week.weekNumber,
        cityName: week.cityName,
        standardEvidence: { unlocked: true },
        interceptClue: { unlocked: true },
      });
      expect(state.evidenceBoard.weeks.filter((boardWeek) => boardWeek.standardEvidence.unlocked)).toHaveLength(1);
      expect(state.evidenceBoard.weeks.filter((boardWeek) => boardWeek.interceptClue.unlocked)).toHaveLength(1);
    }
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

  it("exposes chase bonuses, sudden death, prediction, and the real Platform Sweep tiers", () => {
    const state = buildWeekSimulatorState({
      ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
      phase: "sudden_death",
      fieldOpsAverageLines: 3,
      platformSweepContributors: 4,
      platformSweepActive: true,
      nemesisMode: "complete",
      predictionSubmitted: true,
    });

    expect(state.ritualFlags.suddenDeathActive).toBe(true);
    expect(state.ritualFlags.predictionSubmitted).toBe(true);
    expect(state.seasonState.platformSweep).toMatchObject({
      id: "platform_sweep",
      active: true,
      contributors: 4,
      eligiblePlayers: 4,
      earnedBonus: 0.03,
      nextThresholdCount: null,
    });
    expect(state.seasonState.chase.bonuses).toMatchObject({
      fieldOps: 0.05,
      specialOperation: 0.03,
      nemesisParticipation: 0.01,
      predictionParticipation: 0.01,
      total: 0.1,
    });
  });

  it("drives the primary beat, ritual flags, and evidence toggles", () => {
    const trust = buildWeekSimulatorState({
      ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
      phase: "active",
      dataConfidence: "incomplete",
    });
    expect(trust.seasonState.primaryBeat.id).toBe("group_data_incomplete");

    const sweep = buildWeekSimulatorState({
      ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
      phase: "active",
      briefingViewed: true,
      platformSweepActive: true,
      platformSweepContributors: 1,
    });
    expect(sweep.seasonState.primaryBeat.id).toBe("platform_sweep_started");

    const evidence = buildWeekSimulatorState({
      ...DEFAULT_WEEK_SIMULATOR_CONTROLS,
      outcome: "interception",
      evidenceUnlocked: true,
      interceptUnlocked: true,
    });
    expect(evidence.seasonState.evidencePreview).toMatchObject({
      unlocked: true,
      interceptUnlocked: true,
      standardTitle: "THE BRASS DIAL",
    });
    expect(evidence.evidenceBoard.interceptionCount).toBe(1);
    expect(evidence.evidenceBoard.weeks[0].interceptClue.unlocked).toBe(true);
    expect(evidence.evidenceBoard.weeks[1].standardEvidence.unlocked).toBe(false);
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
