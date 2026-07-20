import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { visitDemo } from "./helpers";

const ROUTES = [
  { label: "map", path: "/map" },
  { label: "field ops", path: "/fieldops" },
  { label: "prediction", path: "/prediction" },
  { label: "nemesis", path: "/nemesis" },
  { label: "evidence", path: "/evidence" },
  { label: "profile", path: "/profile" },
  { label: "onboarding connect", path: "/onboarding/connect" },
  { label: "onboarding target", path: "/onboarding/target" },
  { label: "onboarding objectives", path: "/onboarding/objectives" },
  { label: "onboarding avatar", path: "/onboarding/avatar" },
  { label: "week simulator briefing", path: "/dev/week-simulator?week=1&phase=briefing" },
  { label: "week simulator midweek", path: "/dev/week-simulator?week=2&phase=midweek_update&confidence=incomplete" },
  { label: "week simulator final push", path: "/dev/week-simulator?week=7&phase=final_push&nemesis=bye" },
  { label: "week simulator sudden death", path: "/dev/week-simulator?week=7&phase=sudden_death&nemesis=tiebreak&briefing=true" },
  { label: "week simulator closing", path: "/dev/week-simulator?week=13&phase=case_closing&confidence=recalculating" },
  { label: "week simulator case closed", path: "/dev/week-simulator?week=13&phase=case_closed&outcome=interception" },
];

test.describe("demo accessibility", () => {
  for (const route of ROUTES) {
    test(`${route.label} has no serious or critical axe violations`, async ({ page }) => {
      await visitDemo(page, route.path);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blockingViolations = results.violations
        .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
        .map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          nodes: violation.nodes.map((node) => node.target.join(" ")),
        }));

      expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
    });
  }
});
