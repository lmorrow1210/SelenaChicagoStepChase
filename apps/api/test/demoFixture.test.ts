import { describe, expect, it } from "vitest";
import { demoResponse } from "../../web/lib/demo.js";

describe("demo current-week fixture", () => {
  it("matches the Week 1 Season One response shape", () => {
    const body = demoResponse<{
      city: { name: string };
      nextCity: { name: string };
      route: Array<{ name: string }>;
      seasonState: {
        season: { id: string; weekNumber: number; totalWeeks: number };
        chapter: { city: string; title: string; nextCity: string };
        chase: {
          fieldOpsBonus: number;
          specialOperationBonus: number;
          nemesisParticipationBonus: number;
          predictionParticipationBonus: number;
          totalNonStepBonus: number;
          remainingLead: number;
          finalOutcome: string | null;
        };
        primaryAction: { id: string; priority: number };
        primaryBeat: { id: string; dataConfidence: string } | null;
        platformSweep: { id: string; active: boolean; earnedBonus: number; maxBonus: number };
        evidencePreview: { standardEvidenceId: string; unlocked: boolean; interceptUnlocked: boolean };
        ritualViews: { mondayBriefing: boolean; midweekUpdate: boolean; finalPush: boolean; caseClosed: boolean };
        previousCase: unknown | null;
      };
    }>("/api/weeks/current");

    expect(body).not.toBeNull();
    expect(body!.city.name).toBe("Chicago");
    expect(body!.nextCity.name).toBe("Detroit");
    expect(body!.route.slice(0, 2).map((city) => city.name)).toEqual(["Chicago", "Detroit"]);
    expect(body!.seasonState).toMatchObject({
      season: { id: "season_one", weekNumber: 1, totalWeeks: 13 },
      chapter: { city: "Chicago", title: "The Lakefront Job", nextCity: "Detroit" },
      primaryAction: { id: "continue_pursuit", priority: 10 },
    });
    expect(body!.seasonState.chase.remainingLead).toBe(body!.selenaLeadSteps);
    expect(body!.seasonState.chase.finalOutcome).toBeNull();
    expect(body!.seasonState.primaryBeat).toMatchObject({
      id: "final_push_close_encounter",
      dataConfidence: "verified",
    });
    expect(body!.seasonState.platformSweep).toMatchObject({
      id: "platform_sweep",
      active: true,
      earnedBonus: 0.02,
      maxBonus: 0.03,
    });
    expect(body!.seasonState.chase.specialOperationBonus).toBe(body!.seasonState.platformSweep.earnedBonus);
    expect(body!.seasonState.chase.totalNonStepBonus).toBeCloseTo(
      body!.seasonState.chase.fieldOpsBonus
        + body!.seasonState.chase.specialOperationBonus
        + body!.seasonState.chase.nemesisParticipationBonus
        + body!.seasonState.chase.predictionParticipationBonus,
      5,
    );
    expect(body!.seasonState.evidencePreview).toMatchObject({
      standardEvidenceId: "week01_brass_dial",
      unlocked: false,
      interceptUnlocked: false,
    });
    expect(body!.seasonState.ritualViews).toMatchObject({
      mondayBriefing: true,
      midweekUpdate: true,
      finalPush: false,
      caseClosed: false,
    });
    expect(body!.seasonState.previousCase).toBeNull();
  });

  it("includes the full Season One evidence board", () => {
    const body = demoResponse<{
      season: { id: string; totalWeeks: number };
      interceptionCount: number;
      weeks: Array<{
        weekNumber: number;
        cityName: string;
        outcome: string | null;
        standardEvidence: { title: string; unlocked: boolean };
        interceptClue: { title: string; unlocked: boolean };
      }>;
    }>("/api/evidence");

    expect(body).not.toBeNull();
    expect(body!.season).toMatchObject({ id: "season_one", totalWeeks: 13 });
    expect(body!.weeks).toHaveLength(13);
    expect(body!.weeks[0]).toMatchObject({
      weekNumber: 1,
      cityName: "Chicago",
      outcome: null,
      standardEvidence: { title: "SEALED EVIDENCE", unlocked: false },
      interceptClue: { title: "INTERCEPT CLUE", unlocked: false },
    });
    expect(body!.weeks[1].standardEvidence).toMatchObject({
      title: "SEALED EVIDENCE",
      unlocked: false,
    });
    expect(body!.interceptionCount).toBe(0);
  });

  it("keeps live demo predictions sealed and plausible", () => {
    const body = demoResponse<{
      myPrediction: { predicted_steps: number } | null;
      others: "hidden" | Array<{ predicted_steps: number }>;
      allSubmitted: boolean;
      liveGroupTotal: number;
      state: string;
    }>("/api/predictions/current");

    expect(body).not.toBeNull();
    expect(body!.state).toBe("partial");
    expect(body!.others).toBe("hidden");
    expect(body!.allSubmitted).toBe(false);
    expect(body!.myPrediction?.predicted_steps).toBeGreaterThan(body!.liveGroupTotal);
  });

  it("uses Detroit intel for the Week 1 scouting-ahead fixture", () => {
    const body = demoResponse<{
      reconCity: { name: string };
      intel: Array<{ name: string; fun_fact: string | null; unlocked: boolean }>;
    }>("/api/fieldops");

    expect(body).not.toBeNull();
    expect(body!.reconCity.name).toBe("Detroit");
    expect(body!.intel.slice(0, 3).map((card) => card.name)).toEqual([
      "Michigan Central Station",
      "Guardian Building",
      "RiverWalk",
    ]);
    expect(body!.intel.slice(0, 3).every((card) => card.unlocked && card.fun_fact)).toBe(true);
  });

  it("shows an active Friday nemesis matchup with completed weekday history", () => {
    const body = demoResponse<{
      matchup: { score_a: number; score_b: number; daily_results: Array<{ date: string }> };
      today: string;
      week: { starts_on: string };
      weekMax: number;
      state: string;
    }>("/api/nemesis/current");

    expect(body).not.toBeNull();
    expect(body!.state).toBe("active");
    expect(body!.today).toBe("2026-06-12");
    expect(body!.week.starts_on).toBe("2026-06-08");
    expect(body!.matchup.daily_results.map((day) => day.date)).toEqual([
      "2026-06-08",
      "2026-06-09",
      "2026-06-10",
      "2026-06-11",
    ]);
    expect(body!.matchup).toMatchObject({ score_a: 2, score_b: 1 });
    expect(body!.weekMax).toBeGreaterThan(0);
  });
});
