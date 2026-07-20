import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import type { ReactElement } from "react";
import TestRenderer, {
  act,
  type ReactTestInstance,
  type ReactTestRenderer,
  type ReactTestRendererJSON,
  type ReactTestRendererNode,
} from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoResponse } from "../../../lib/demo";
import MapPage from "./page";
import { PredictionSection } from "./PredictionSection";

const harness = vi.hoisted(() => ({
  session: {
    loading: false,
    user: null as unknown,
    group: null as unknown,
    activeWeek: null as unknown,
    refresh: vi.fn(),
  },
  queryResults: new Map<string, unknown>(),
  api: vi.fn(),
  refetch: vi.fn(),
  invalidateQueries: vi.fn(),
}));
const repoRoot = resolve("../..");

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((options: { queryKey: unknown[] }) => {
    const result = harness.queryResults.get(JSON.stringify(options.queryKey));
    return result ?? { data: null, isLoading: false, isError: false, refetch: harness.refetch };
  }),
  useQueryClient: vi.fn(() => ({ invalidateQueries: harness.invalidateQueries })),
}));

vi.mock("../../../lib/api", () => {
  class ApiError extends Error {
    constructor(
      public status: number,
      public code: string,
      message: string,
    ) {
      super(message);
    }
  }

  return {
    api: harness.api,
    ApiError,
  };
});

vi.mock("../../../lib/session", () => ({
  useSession: () => harness.session,
}));

vi.mock("../../../lib/SundayCountdown", () => ({
  SundayCountdown: () => <span>She vanishes in 2d 5h</span>,
}));

function clone<T>(value: T): T {
  return structuredClone(value);
}

function setQueryResult(queryKey: unknown[], data: unknown, refetch = harness.refetch) {
  harness.queryResults.set(JSON.stringify(queryKey), {
    data,
    isLoading: false,
    isError: false,
    refetch,
  });
}

function baseMapPayload() {
  const payload = clone(demoResponse<Record<string, unknown>>("/api/weeks/current")!);
  const seasonState = payload.seasonState as {
    ritualViews: { finalPush: boolean };
  };
  seasonState.ritualViews.finalPush = true;
  return payload;
}

function basePredictionPayload(overrides: Record<string, unknown> = {}) {
  return {
    ...clone(demoResponse<Record<string, unknown>>("/api/predictions/current")!),
    ...overrides,
  };
}

function render(node: ReactElement): ReactTestRenderer {
  let renderer: ReactTestRenderer | null = null;
  act(() => {
    renderer = TestRenderer.create(node);
  });
  return renderer!;
}

function textOf(node: ReactTestRendererNode | ReactTestRendererNode[] | null): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node.type === "style") return "";
  return textOf(node.children ?? null);
}

function directTextOf(node: ReactTestRendererJSON): string {
  return (node.children ?? []).filter((child): child is string => typeof child === "string").join("");
}

function instanceText(instance: ReactTestInstance): string {
  return instance.children
    .map((child) => typeof child === "string" ? child : instanceText(child))
    .join("");
}

function walkJson(
  node: ReactTestRendererNode | ReactTestRendererNode[] | null,
  visitor: (node: ReactTestRendererJSON) => void,
) {
  if (!node || typeof node === "string") return;
  if (Array.isArray(node)) {
    node.forEach((child) => walkJson(child, visitor));
    return;
  }
  visitor(node);
  walkJson(node.children ?? null, visitor);
}

function orderedIndex(
  tree: ReactTestRendererJSON | ReactTestRendererJSON[] | null,
  predicate: (node: ReactTestRendererJSON) => boolean,
): number {
  let index = 0;
  let found = -1;
  walkJson(tree, (node) => {
    if (found < 0 && predicate(node)) found = index;
    index += 1;
  });
  return found;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [path] : [];
  });
}

function fileText(path: string): string {
  return readFileSync(path, "utf8");
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  const session = demoResponse<{
    user: unknown;
    group: unknown;
    activeWeek: unknown;
  }>("/api/auth/session")!;
  harness.session = { ...session, loading: false, refresh: vi.fn() };
  harness.queryResults.clear();
  harness.api.mockReset().mockResolvedValue({ ok: true });
  harness.refetch.mockReset().mockResolvedValue({ data: null });
  harness.invalidateQueries.mockReset();
});

describe("Map prediction placement", () => {
  it("renders the demo fixture as a filed forecast on the map", () => {
    setQueryResult(["map", "current"], baseMapPayload());
    setQueryResult(["predictions", "current"], basePredictionPayload());

    const tree = render(<MapPage />).toJSON();
    const text = textOf(tree);

    expect(text).toContain("Forecast filed");
    expect(text).toContain("Your call:");
    expect(text).toContain("205,000");
    expect(text).toContain("Sealed until Sunday 11:59 PM.");
  });

  it("keeps the map hierarchy in the approved order", () => {
    setQueryResult(["map", "current"], baseMapPayload());
    setQueryResult(["predictions", "current"], basePredictionPayload());

    const tree = render(<MapPage />).toJSON();
    const markers = {
      chapterHeader: orderedIndex(
        tree,
        (node) => node.type === "header" && node.props.className === "chapterHeader",
      ),
      phaseAlert: orderedIndex(tree, (node) => node.props["aria-label"] === "Final push"),
      chaseConsole: orderedIndex(tree, (node) => node.props["aria-label"] === "Tracking vector terminal"),
      progressStrip: orderedIndex(tree, (node) => directTextOf(node).includes("[ Team progress:")),
      leaderboard: orderedIndex(tree, (node) => node.props["aria-label"] === "Leaderboard"),
      prediction: orderedIndex(tree, (node) => node.props["aria-label"] === "Weekly prediction"),
      cards: orderedIndex(
        tree,
        (node) => typeof node.props.className === "string" && node.props.className.includes("systemCards"),
      ),
      route: orderedIndex(tree, (node) => node.props["aria-label"] === "Route cities"),
    };

    expect(Object.values(markers).every((index) => index >= 0)).toBe(true);
    expect(Object.entries(markers).sort((a, b) => a[1] - b[1]).map(([name]) => name)).toEqual([
      "chapterHeader",
      "phaseAlert",
      "chaseConsole",
      "progressStrip",
      "leaderboard",
      "prediction",
      "cards",
      "route",
    ]);
  });

  it("keeps removed map surfaces and old route wording out of app code", () => {
    const appRoot = join(repoRoot, "apps/web");
    const mapSource = fileText(join(repoRoot, "apps/web/app/(game)/map/page.tsx"));
    const webText = sourceFiles(appRoot)
      .filter((path) => !path.endsWith("mapPage.test.tsx"))
      .map(fileText)
      .join("\n");

    expect(mapSource).not.toMatch(/\bPrimaryActionCard\b/);
    expect(mapSource).not.toMatch(/\bPlatformSweepCard\b/);
    expect(mapSource).not.toMatch(/\bTeamActivity\b/);
    expect(webText).not.toContain(["Bureau", "vector"].join(" "));
  });

  it("keeps legacy action and sweep cards confined to the dev simulator", () => {
    const appRoot = join(repoRoot, "apps/web/app");
    const matches = new Map<string, string[]>();

    for (const component of ["PrimaryActionCard", "PlatformSweepCard", "TeamActivity"]) {
      matches.set(component, []);
    }

    for (const path of sourceFiles(appRoot).filter((file) => !file.endsWith("mapPage.test.tsx"))) {
      const source = fileText(path);
      for (const component of matches.keys()) {
        if (new RegExp(`\\b${component}\\b`).test(source)) {
          matches.get(component)!.push(relative(repoRoot, path));
        }
      }
    }

    expect(Object.fromEntries(matches)).toEqual({
      PrimaryActionCard: ["apps/web/app/dev/week-simulator/page.tsx"],
      PlatformSweepCard: ["apps/web/app/dev/week-simulator/page.tsx"],
      TeamActivity: [],
    });
  });
});

describe("PredictionSection submit and lock states", () => {
  it("posts the filed forecast and refetches the prediction query", async () => {
    const refetch = vi.fn().mockResolvedValue({ data: null });
    setQueryResult(
      ["predictions", "current"],
      basePredictionPayload({
        myPrediction: null,
        submissionOpen: true,
        state: "pending",
      }),
      refetch,
    );

    const renderer = render(<PredictionSection />);
    const range = renderer.root.findByProps({ type: "range" });
    act(() => {
      range.props.onChange({ target: { value: "250000" } });
    });
    const fileButton = renderer.root
      .findAllByType("button")
      .find((button) => instanceText(button).includes("File forecast"));

    expect(fileButton).toBeDefined();
    await act(async () => {
      fileButton!.props.onClick();
      await flushAsyncWork();
    });

    expect(harness.api).toHaveBeenCalledWith("/api/predictions", {
      method: "POST",
      body: JSON.stringify({ predicted_steps: 250000 }),
    });
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders calls-locked state without active submit controls", () => {
    setQueryResult(
      ["predictions", "current"],
      basePredictionPayload({
        myPrediction: null,
        submissionOpen: false,
        state: "final",
      }),
    );

    const renderer = render(<PredictionSection />);
    const text = textOf(renderer.toJSON());
    const submitButton = renderer.root
      .findAllByType("button")
      .find((button) => instanceText(button).includes("File forecast"));
    const range = renderer.root.findByProps({ type: "range" });
    const numeric = renderer.root.findByProps({ inputMode: "numeric" });

    expect(text).toContain("Calls lock on Mondays — back next week.");
    expect(submitButton?.props.disabled).toBe(true);
    expect(range.props.disabled).toBe(true);
    expect(numeric.props.disabled).toBe(true);
  });
});

describe("PredictionCard mobile affordances", () => {
  it("keeps the map prediction panel single-column on phone widths", () => {
    const predictionSource = fileText(join(repoRoot, "apps/web/app/(game)/map/PredictionSection.tsx"));

    expect(predictionSource).toContain("@media (max-width: 767px)");
    expect(predictionSource).toContain("grid-template-columns: 1fr;");
  });

  it("keeps the slider on the shared 44px touch target", () => {
    const sliderSource = fileText(join(repoRoot, "packages/design-system/components/forms/Slider.jsx"));

    expect(sliderSource).toContain("height: 'var(--touch-min)'");
    expect(sliderSource.match(/height: 'var\(--touch-min\)'/g)).toHaveLength(2);
  });
});
