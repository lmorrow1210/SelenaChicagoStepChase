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
        chase: { remainingLead: number; finalOutcome: string | null };
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
    expect(body!.seasonState.chase.remainingLead).toBe(9885);
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
      outcome: "close_encounter",
      standardEvidence: { title: "THE BRASS DIAL", unlocked: true },
      interceptClue: { title: "INTERCEPT CLUE", unlocked: false },
    });
    expect(body!.weeks[1].standardEvidence).toMatchObject({
      title: "SEALED EVIDENCE",
      unlocked: false,
    });
    expect(body!.interceptionCount).toBe(0);
  });
});
