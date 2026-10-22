import { describe, expect, it } from "vitest";
import type { WeeklyOutcome } from "@one-step-ahead/shared";
import { SEASON_ONE_CONFIG, WEEK_ONE_CHICAGO, getEvidence, getSeasonWeek } from "@one-step-ahead/shared/season-one/seasonOne";

const ROUTE_CITY_NAMES = [
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
];

const WEEKLY_OUTCOME_KEYS: WeeklyOutcome[] = [
  "close_encounter",
  "interception",
  "pursuit_maintained",
  "trail_lost",
];

function expectNonEmpty(value: string): void {
  expect(value.trim().length).toBeGreaterThan(0);
}

function collectStrings(value: unknown, path: string[] = []): Array<{ path: string; value: string }> {
  if (typeof value === "string") return [{ path: path.join("."), value }];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, [...path, String(index)]));
  }
  return Object.entries(value).flatMap(([key, item]) => collectStrings(item, [...path, key]));
}

describe("Season One config", () => {
  it("contains all 13 config entries in route order", () => {
    expect(SEASON_ONE_CONFIG.route.map((week) => week.weekNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(SEASON_ONE_CONFIG.route.map((week) => week.cityName)).toEqual(ROUTE_CITY_NAMES);
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
      const standardEvidence = getEvidence(week.evidence.standardEvidenceId);
      const interceptClue = getEvidence(week.evidence.interceptClueId);

      expect(standardEvidence).toMatchObject({
        kind: "standard",
        weekNumber: week.weekNumber,
        cityName: week.cityName,
      });
      expect(interceptClue).toMatchObject({
        kind: "intercept",
        weekNumber: week.weekNumber,
        cityName: week.cityName,
      });
    }
  });

  it("uses unique evidence IDs across every route slot", () => {
    const routeEvidenceIds = SEASON_ONE_CONFIG.route.flatMap((week) => [
      week.evidence.standardEvidenceId,
      week.evidence.interceptClueId,
    ]);

    expect(routeEvidenceIds).toHaveLength(26);
    expect(new Set(routeEvidenceIds).size).toBe(routeEvidenceIds.length);
  });

  it("keeps every week fully filled out with all Case Closed outcomes", () => {
    for (const week of SEASON_ONE_CONFIG.route) {
      expectNonEmpty(week.chapterTitle);
      expectNonEmpty(week.complication.id);
      expectNonEmpty(week.complication.label);
      expectNonEmpty(week.complication.summary);
      expect(Object.keys(week.closeCopy).sort()).toEqual(WEEKLY_OUTCOME_KEYS);

      for (const outcome of WEEKLY_OUTCOME_KEYS) {
        expectNonEmpty(week.closeCopy[outcome].headline);
        expectNonEmpty(week.closeCopy[outcome].story);
        expectNonEmpty(week.closeCopy[outcome].selena);
        expectNonEmpty(week.closeCopy[outcome].nextLead);
      }
    }
  });

  it("keeps the 13-week outcome matrix and Selena teaser lines complete and distinct", () => {
    const outcomeAndTeaserSelenaLines: string[] = [];

    for (const week of SEASON_ONE_CONFIG.route) {
      for (const outcome of WEEKLY_OUTCOME_KEYS) {
        const close = week.closeCopy[outcome];
        expectNonEmpty(close.headline);
        expectNonEmpty(close.story);
        expectNonEmpty(close.selena);
        expectNonEmpty(close.nextLead);
        outcomeAndTeaserSelenaLines.push(close.selena);
      }
      expectNonEmpty(week.nextCityTeaser.selena);
      outcomeAndTeaserSelenaLines.push(week.nextCityTeaser.selena);
    }

    expect(outcomeAndTeaserSelenaLines).toHaveLength(65);
    expect(new Set(outcomeAndTeaserSelenaLines).size).toBe(outcomeAndTeaserSelenaLines.length);
  });

  it("keeps Selena lines free of exclamation marks", () => {
    const selenaLines = SEASON_ONE_CONFIG.route.flatMap((week) =>
      collectStrings(week).filter(({ path }) => path.endsWith(".selena")),
    );

    expect(selenaLines.length).toBeGreaterThan(65);
    for (const line of selenaLines) {
      expect(line.value, line.path).not.toContain("!");
    }
  });

  it("keeps runtime placeholders only in renderer-substituted fields", () => {
    const placeholders = SEASON_ONE_CONFIG.route.flatMap((week, index) =>
      collectStrings(week, [`week${index + 1}`]).filter(({ value }) => value.includes("{{groupName}}")),
    );

    for (const placeholder of placeholders) {
      expect(placeholder.path).toMatch(
        /^week\d+\.(closeCopy\.(close_encounter|interception|pursuit_maintained)\.story|rituals\.midweek\.strongPace\.body)$/,
      );
    }
  });

  it("chains next-city teasers from Chicago through San Francisco without dangling cities", () => {
    SEASON_ONE_CONFIG.route.slice(0, -1).forEach((week, index) => {
      const nextWeek = SEASON_ONE_CONFIG.route[index + 1];
      expect(week.nextCityTeaser.cityName).toBe(nextWeek.cityName);
      expect(week.nextCityTeaser.header).toContain(nextWeek.cityName.toUpperCase());
      expectNonEmpty(week.nextCityTeaser.body);
      expectNonEmpty(week.nextCityTeaser.selena);
      expectNonEmpty(week.nextCityTeaser.cta);
    });

    const finalWeek = SEASON_ONE_CONFIG.route.at(-1)!;
    expect(finalWeek.cityName).toBe("San Francisco");
    expect(finalWeek.nextCityTeaser.cityName).toBe("");
    expect(finalWeek.nextCityTeaser.header).toBe("THE CASE IS CLOSED");
    expectNonEmpty(finalWeek.nextCityTeaser.body);
    expectNonEmpty(finalWeek.nextCityTeaser.selena);
    expectNonEmpty(finalWeek.nextCityTeaser.cta);
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
    // Exactly one code per non-free board slot (5×5 minus the free space).
    // The two Chicago story tiles are payoffs, not tiles.
    expect(WEEK_ONE_CHICAGO.fieldOps.fixedChallengeCodes).toHaveLength(24);
    expect(new Set(WEEK_ONE_CHICAGO.fieldOps.fixedChallengeCodes).size).toBe(24);
    expect(WEEK_ONE_CHICAGO.fieldOps.fixedChallengeCodes).not.toContain("find_the_platform");
    expect(WEEK_ONE_CHICAGO.fieldOps.firstLinePayoff).toContain("departure platform");
    expect(WEEK_ONE_CHICAGO.rituals.midweek.storyReveal.headline).toBe("DEPARTURE ROUTE CONFIRMED");
    expect(WEEK_ONE_CHICAGO.rituals.suddenDeath.headline).toBe("SUDDEN DEATH");
    expect(WEEK_ONE_CHICAGO.rituals.caseClosing.body).toBe("Final field reports are being reconciled.");
    expect(WEEK_ONE_CHICAGO.specialOperation).toMatchObject({
      id: "platform_sweep",
      type: "participation_threshold",
      minimumVerifiedStepsPerPlayer: 2000,
      startDay: 5,
      endDay: 6,
    });
  });

  it("includes all four Week 1 case closed outcomes", () => {
    expect(Object.keys(WEEK_ONE_CHICAGO.closeCopy).sort()).toEqual(WEEKLY_OUTCOME_KEYS);
    expect(WEEK_ONE_CHICAGO.closeCopy.interception.headline).toBe("SELENA INTERCEPTED");
  });

  it("returns weeks by week number", () => {
    expect(getSeasonWeek(1)?.cityName).toBe("Chicago");
    expect(getSeasonWeek(13)?.cityName).toBe("San Francisco");
    expect(getSeasonWeek(99)).toBeUndefined();
  });
});
