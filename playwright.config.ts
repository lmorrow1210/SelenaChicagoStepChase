import { defineConfig, devices } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/SelenaChicagoStepChase";
const port = Number(process.env.QA_DEMO_PORT ?? 4173);

export default defineConfig({
  testDir: "./qa/browser",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `node scripts/serve-static-demo.mjs apps/web/out ${port} ${basePath}`,
    url: `http://127.0.0.1:${port}${basePath}/map`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
