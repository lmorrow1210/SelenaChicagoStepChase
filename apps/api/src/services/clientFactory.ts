import type { Pool } from "pg";
import { MockFitbitClient, type FitbitClient } from "./fitbitClient.js";
import { RealFitbitClient } from "./realFitbitClient.js";

// One FitbitClient per process, shared by the sync route and the cron.
// HEALTH_API_MODE=real|mock overrides; default real in production, mock
// everywhere else (tests always inject MockFitbitClient directly).

let instance: FitbitClient | null = null;

export function getFitbitClient(pool: Pool): FitbitClient {
  if (!instance) {
    const mode =
      process.env.HEALTH_API_MODE ??
      (process.env.NODE_ENV === "production" ? "real" : "mock");
    instance = mode === "real" ? new RealFitbitClient(pool) : new MockFitbitClient();
  }
  return instance;
}
