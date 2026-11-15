// Generated from apps/api/openapi.yaml — regenerate with `npm run gen:api-types -w apps/web`.
export type { paths as ApiPaths, components as ApiComponents } from "./api-types";

import { DEMO } from "./demoFlags";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const BASE = API_BASE;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Static demo build (GitHub Pages): no backend — resolve baked fixtures.
  if (DEMO) {
    // Loaded on demand: the fixtures carry the whole Season One config, which
    // the live build never needs and the demo needs only after first paint.
    const { demoResponse, demoMutation } = await import("./demo");
    const method = (init?.method ?? "GET").toUpperCase();
    if (method !== "GET") return demoMutation<T>(path, init?.body);
    const fixture = demoResponse<T>(path);
    if (fixture !== null) return fixture;
    throw new ApiError(404, "DEMO_MISS", `No demo fixture for ${path}`);
  }

  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? res.statusText,
    );
  }
  return res.json();
}
