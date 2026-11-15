import { isValidElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { WeeklyOutcome } from "@one-step-ahead/shared";
import { SEASON_ONE_CONFIG, getEvidence } from "@one-step-ahead/shared/season-one/seasonOne";
import { CaseClosedReport, type CaseClosedData } from "./CaseClosedReport";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (isValidElement(node) && node.type !== "style") {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function dataFor(outcome: WeeklyOutcome): CaseClosedData {
  return {
    outcome,
    groupName: "Test Unit",
    groupTotalSteps: 1000,
    groupTargetSteps: 1000,
    finalProgress: 0.5,
    bonuses: null,
    interceptUnlocked: outcome === "interception",
    dataConfidence: "verified",
  };
}

function render(weekNumber: number, outcome: WeeklyOutcome): string {
  const weekConfig = SEASON_ONE_CONFIG.route.find((w) => w.weekNumber === weekNumber)!;
  const tree = CaseClosedReport({ weekConfig, data: dataFor(outcome), onDismiss: () => {} });
  return textOf(tree);
}

const NON_INTERCEPT: WeeklyOutcome[] = ["trail_lost", "pursuit_maintained", "close_encounter"];
const WEEKS_WITH_FALLBACK = SEASON_ONE_CONFIG.route.filter((w) => w.nextCityTeaser.bodyWithoutIntercept);

describe("Case Closed teaser spoiler rule", () => {
  it("has a fallback for every week that points at a next city (Weeks 2-12)", () => {
    expect(WEEKS_WITH_FALLBACK.map((w) => w.weekNumber)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  for (const week of WEEKS_WITH_FALLBACK) {
    const clue = getEvidence(week.evidence.interceptClueId);
    const teaser = week.nextCityTeaser;

    it(`Week ${week.weekNumber}: fallback does not restate the intercept clue`, () => {
      expect(clue).toBeDefined();
      for (const field of [teaser.bodyWithoutIntercept!, teaser.selenaWithoutIntercept ?? ""]) {
        if (clue!.highlightedFragment) expect(field).not.toContain(clue!.highlightedFragment);
        expect(field).not.toContain(clue!.body);
        if (clue!.enhancedBody) expect(field).not.toContain(clue!.enhancedBody);
      }
    });

    it(`Week ${week.weekNumber}: non-intercept outcomes see the fallback, interception sees the full teaser`, () => {
      for (const outcome of NON_INTERCEPT) {
        const text = render(week.weekNumber, outcome);
        expect(text).toContain(teaser.bodyWithoutIntercept!);
        expect(text).not.toContain(teaser.body);
        expect(text).toContain(teaser.selenaWithoutIntercept ?? teaser.selena);
        if (teaser.selenaWithoutIntercept) expect(text).not.toContain(teaser.selena);
      }
      const intercepted = render(week.weekNumber, "interception");
      expect(intercepted).toContain(teaser.body);
      expect(intercepted).toContain(teaser.selena);
      expect(intercepted).not.toContain(teaser.bodyWithoutIntercept!);
    });

    it(`Week ${week.weekNumber}: fallback still names the next city`, () => {
      expect(teaser.bodyWithoutIntercept).toContain(teaser.cityName.split(",")[0]);
    });
  }

  it("withholds Selena's line when data is not verified, even with a fallback", () => {
    const week = WEEKS_WITH_FALLBACK[0];
    const tree = CaseClosedReport({
      weekConfig: week,
      data: { ...dataFor("trail_lost"), dataConfidence: "recalculating" },
      onDismiss: () => {},
    });
    const text = textOf(tree);
    expect(text).not.toContain(week.nextCityTeaser.selena);
    expect(text).toContain(week.nextCityTeaser.bodyWithoutIntercept!);
  });
});
