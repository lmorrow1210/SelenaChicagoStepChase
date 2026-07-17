import { describe, expect, it } from "vitest";
import { SEASON_ONE_CONFIG, WEEK_ONE_CHICAGO, getEvidence, getSeasonWeek } from "@one-step-ahead/shared/season-one/seasonOne";

describe("Season One config", () => {
  it("contains all 13 config entries in route order", () => {
    expect(SEASON_ONE_CONFIG.route.map((week) => week.weekNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(SEASON_ONE_CONFIG.route.map((week) => week.cityName)).toEqual([
      "Chicago",
      "Detroit",
      "Pittsburgh",
      "Washington, D.C.",
      "Philadelphia",
      "New York City",
      "Boston",
      "Savannah",
      "New Orleans",
      "Austin",
      "Santa Fe",
      "Los Angeles",
      "San Francisco",
    ]);
  });

  it("uses unique week numbers, week IDs, and evidence IDs", () => {
    const weekNumbers = SEASON_ONE_CONFIG.route.map((week) => week.weekNumber);
    const weekIds = SEASON_ONE_CONFIG.route.map((week) => week.id);
    const evidenceIds = SEASON_ONE_CONFIG.evidence.map((evidence) => evidence.id);

    expect(new Set(weekNumbers).size).toBe(13);
    expect(new Set(weekIds).size).toBe(13);
    expect(new Set(evidenceIds).size).toBe(SEASON_ONE_CONFIG.evidence.length);
  });

  it("connects every weekly evidence reference to an evidence config entry", () => {
    for (const week of SEASON_ONE_CONFIG.route) {
      expect(getEvidence(week.evidence.standardEvidenceId)?.weekNumber).toBe(week.weekNumber);
      expect(getEvidence(week.evidence.interceptClueId)?.weekNumber).toBe(week.weekNumber);
    }
  });

  it("includes required polished Week 1 Chicago copy and config fields", () => {
    expect(WEEK_ONE_CHICAGO).toMatchObject({
      cityName: "Chicago",
      chapterTitle: "The Lakefront Job",
      complication: { id: "cold_start", label: "Cold Start" },
      briefing: {
        label: "BUREAU FIELD BRIEFING",
        title: "CASE 01: THE LAKEFRONT JOB",
        primaryCta: "Begin the pursuit",
        secondaryCta: "Review assignment",
      },
      evidence: {
        standardEvidenceId: "week01_brass_dial",
        interceptClueId: "week01_access_before_entry",
      },
      nextCityTeaser: {
        cityName: "Detroit",
        header: "NEXT: DETROIT",
        cta: "Continue the pursuit",
      },
    });
    expect(WEEK_ONE_CHICAGO.briefing.body).toHaveLength(3);
    expect(WEEK_ONE_CHICAGO.briefing.supportingCards.map((card) => card.id)).toEqual(["field_ops", "prediction", "nemesis"]);
    expect(WEEK_ONE_CHICAGO.fieldOps.fixedChallengeCodes).toHaveLength(25);
    expect(WEEK_ONE_CHICAGO.specialOperation).toMatchObject({
      id: "platform_sweep",
      type: "participation_threshold",
      minimumVerifiedStepsPerPlayer: 2000,
      startDay: 5,
      endDay: 6,
    });
  });

  it("includes all four Week 1 case closed outcomes", () => {
    expect(Object.keys(WEEK_ONE_CHICAGO.closeCopy).sort()).toEqual([
      "close_encounter",
      "interception",
      "pursuit_maintained",
      "trail_lost",
    ]);
    expect(WEEK_ONE_CHICAGO.closeCopy.interception.headline).toBe("SELENA INTERCEPTED");
  });

  it("returns weeks by week number", () => {
    expect(getSeasonWeek(1)?.cityName).toBe("Chicago");
    expect(getSeasonWeek(13)?.cityName).toBe("San Francisco");
    expect(getSeasonWeek(99)).toBeUndefined();
  });
});
