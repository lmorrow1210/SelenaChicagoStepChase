import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { chromium } from "playwright";
import { createStaticDemoServer } from "./serve-static-demo.mjs";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/SelenaChicagoStepChase";
const PORT = Number(process.env.LIGHTHOUSE_DEMO_PORT ?? 4174);
const OUTPUT_DIR = resolve(".lighthouseci");
const ROUTES = [
  "/map",
  "/fieldops",
  "/prediction",
  "/nemesis",
  "/evidence",
  "/profile",
  "/dev/week-simulator?week=13&phase=case_closed&outcome=interception",
];
const MIN_SCORES = {
  performance: Number(process.env.LH_MIN_PERFORMANCE ?? 0.5),
  accessibility: Number(process.env.LH_MIN_ACCESSIBILITY ?? 0.95),
  "best-practices": Number(process.env.LH_MIN_BEST_PRACTICES ?? 0.95),
  seo: Number(process.env.LH_MIN_SEO ?? 0.9),
};

await mkdir(OUTPUT_DIR, { recursive: true });
const app = createStaticDemoServer({ port: PORT, basePath: BASE_PATH });
await app.listen();

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const failures = [];

try {
  for (const route of ROUTES) {
    const url = `http://127.0.0.1:${PORT}${BASE_PATH}${route}`;
    const result = await lighthouse(url, {
      port: chrome.port,
      logLevel: "error",
      output: "json",
      onlyCategories: Object.keys(MIN_SCORES),
      formFactor: "desktop",
      screenEmulation: { disabled: true },
    });
    if (!result?.lhr) throw new Error(`Lighthouse did not return a report for ${route}`);

    const routeName = route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/-$/, "") || "home";
    await writeFile(resolve(OUTPUT_DIR, `${routeName}.json`), result.report);

    const scores = Object.fromEntries(
      Object.entries(MIN_SCORES).map(([category]) => [category, result.lhr.categories[category]?.score ?? 0]),
    );
    process.stdout.write(`${route}: ${formatScores(scores)}\n`);

    for (const [category, minimum] of Object.entries(MIN_SCORES)) {
      const score = scores[category] ?? 0;
      if (score < minimum) {
        failures.push(`${route} ${category} ${Math.round(score * 100)} < ${Math.round(minimum * 100)}`);
      }
    }
  }
} finally {
  await chrome.kill();
  await app.close();
}

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`${failure}\n`);
  process.exit(1);
}

function formatScores(scores) {
  return Object.entries(scores)
    .map(([category, score]) => `${category}=${Math.round(score * 100)}`)
    .join(", ");
}
