import { expect, test } from "@playwright/test";
import { DEMO_BASE_PATH, expectNoHorizontalOverflow, visitDemo } from "./helpers";

const MAIN_ROUTES = [
  "/map",
  "/fieldops",
  "/prediction",
  "/nemesis",
  "/evidence",
  "/profile",
  "/onboarding/connect",
  "/onboarding/target",
  "/onboarding/objectives",
  "/onboarding/avatar",
  "/dev/week-simulator?week=13&phase=case_closed&outcome=interception",
  "/finale",
];

const OUTCOME_MARKERS = new Map([
  ["trail_lost", "CASE FILED"],
  ["pursuit_maintained", "CITY STAMPED"],
  ["close_encounter", "NEAR CAPTURE"],
  ["interception", "INTERCEPTION"],
]);

test.describe("demo browser smoke", () => {
  for (const route of MAIN_ROUTES) {
    test(`${route} loads without mobile horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await visitDemo(page, route);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("briefing opens, traps focus, dismisses, and reopens", async ({ page }) => {
    await visitDemo(page, "/map");

    await page.getByRole("button", { name: /review assignment/i }).click();
    const dialog = page.getByRole("dialog", { name: /case 01/i });
    await expect(dialog).toBeVisible();
    await expect(dialog).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: /skip briefing/i })).toBeFocused();

    await page.getByRole("button", { name: /begin the pursuit/i }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: /review assignment/i }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("prediction submit flow files a forecast in the QA demo", async ({ page }) => {
    await visitDemo(page, "/prediction");

    await expect(page.getByRole("heading", { name: /prediction/i })).toBeVisible();
    await page.getByRole("button", { name: /file forecast/i }).click();
    await expect(page.getByRole("heading", { name: /forecast filed/i })).toBeVisible();
  });

  test("week simulator can render all four case-closed outcomes", async ({ page }) => {
    for (const [outcome, marker] of OUTCOME_MARKERS) {
      await visitDemo(page, `/dev/week-simulator?week=13&phase=case_closed&outcome=${outcome}&briefing=true`);
      await page.getByRole("button", { name: /trigger case closed/i }).click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toContainText(marker);
      await expect(dialog.getByRole("heading", { name: /one lap complete/i })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });

  test("week 13 send-off: plays, skips to the end card, replays, continues to the map", async ({ page }) => {
    await visitDemo(page, "/dev/week-simulator?week=13&phase=case_closed&outcome=interception&briefing=true");
    await page.getByRole("button", { name: /trigger case closed/i }).click();
    await page.getByRole("button", { name: /watch the send-off/i }).click();

    const finale = page.getByRole("dialog", { name: /the send-off/i });
    await expect(finale).toBeVisible();
    await expect(finale).toBeFocused();
    // Skip is the first tab stop and reachable by keyboard.
    await page.keyboard.press("Tab");
    await expect(finale.getByRole("button", { name: /^skip$/i })).toBeFocused();
    // The canvas is decorative; Selena's words are real DOM text for screen readers.
    await expect(finale.getByRole("img")).toHaveAttribute("aria-label", /cable car/i);
    await expect(finale.getByRole("status")).toContainText(/loved the chase/i, { timeout: 12_000 });

    await page.keyboard.press("Enter"); // activates Skip
    const endCard = finale.getByRole("heading", { name: /the chase begins again/i });
    await expect(endCard).toBeVisible();
    await expect(finale.getByRole("button", { name: /continue to the map/i })).toBeFocused();

    await finale.getByRole("button", { name: /replay/i }).click();
    await expect(finale.getByRole("button", { name: /^skip$/i })).toBeVisible();
    await page.keyboard.press("Escape"); // Escape also skips
    await expect(endCard).toBeVisible();

    await page.keyboard.press("Escape"); // on the end card Escape closes
    await expect(finale).toBeHidden();
    await expect(page.getByRole("button", { name: /watch the send-off|trigger case closed/i }).first()).toBeFocused();
  });

  test("week 13 send-off honors reduced motion with static frames and the same text", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await visitDemo(page, "/finale");
    await expect(page.getByText(/loved the chase/i).first()).toBeVisible();
    await expect(page.getByText(/would not unpack/i).first()).toBeVisible();
    await expect(page.getByText("— S.C.").first()).toBeVisible();
    await page.getByRole("button", { name: /next frame/i }).click();
    await expect(page.getByRole("heading", { name: /the chase begins again/i })).toBeVisible();
    await page.getByRole("button", { name: /continue to the map/i }).click();
    await expect(page).toHaveURL(new RegExp(`${DEMO_BASE_PATH}/map/?$`));
  });

  test("week simulator exposes evidence board reveal states", async ({ page }) => {
    await visitDemo(page, "/dev/week-simulator?week=1&phase=case_closed&outcome=interception&evidence=true&intercept=true&briefing=true");

    await expect(page.getByText("THE BRASS DIAL").first()).toBeVisible();
    await expect(page.getByText(/INTERCEPT CLUE.*THE CALLING CARD/).first()).toBeVisible();
    await expect(page.getByText(/Interceptions:/i).first()).toContainText("1");
  });

  test("onboarding step flow reaches the map", async ({ page }) => {
    await visitDemo(page, "/onboarding/connect");

    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page).toHaveURL(new RegExp(`${DEMO_BASE_PATH}/onboarding/target/?$`));

    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page).toHaveURL(new RegExp(`${DEMO_BASE_PATH}/onboarding/objectives/?$`));

    await page.getByRole("button", { name: /save and continue/i }).click();
    await expect(page).toHaveURL(new RegExp(`${DEMO_BASE_PATH}/onboarding/avatar/?$`));

    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page).toHaveURL(new RegExp(`${DEMO_BASE_PATH}/onboarding/group/?$`));

    await page.getByRole("button", { name: /open map/i }).click();
    await expect(page).toHaveURL(new RegExp(`${DEMO_BASE_PATH}/map/?$`));
  });
});
