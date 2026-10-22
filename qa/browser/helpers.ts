import { expect, type Page } from "@playwright/test";

export const DEMO_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/SelenaChicagoStepChase";

export async function visitDemo(page: Page, path: string) {
  await page.goto(`${DEMO_BASE_PATH}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  await expect(page.locator("body")).toBeVisible();
  await page.waitForFunction(() => !document.querySelector("[aria-busy='true']"));
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return Math.ceil(root.scrollWidth - root.clientWidth);
  });
  expect(overflow).toBeLessThanOrEqual(1);
}
