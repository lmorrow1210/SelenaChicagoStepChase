import { describe, expect, it } from "vitest";
import { assertSafeEnvironment, environmentProblems } from "../src/lib/env.js";

const GOOD_PROD = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://db.internal/app",
  JWT_SECRET: "j".repeat(64),
  TOKEN_ENC_KEY: "a".repeat(64),
  WEB_ORIGIN: "https://app.example.com",
  GOOGLE_CLIENT_ID: "id",
  GOOGLE_CLIENT_SECRET: "secret",
  GOOGLE_REDIRECT_URI: "https://api.example.com/api/auth/google/callback",
  HEALTH_API_MODE: "mock",
};

describe("boot environment guard", () => {
  it("accepts a complete production config", () => {
    expect(environmentProblems(GOOD_PROD)).toEqual([]);
    expect(() => assertSafeEnvironment(GOOD_PROD)).not.toThrow();
  });

  it("accepts plain local development and test", () => {
    expect(environmentProblems({})).toEqual([]);
    expect(environmentProblems({ NODE_ENV: "development", WEB_ORIGIN: "http://localhost:3000" })).toEqual([]);
    expect(environmentProblems({ NODE_ENV: "test" })).toEqual([]);
  });

  it("refuses a deployed server without NODE_ENV=production (dev-login would be open)", () => {
    const { NODE_ENV: _omit, ...noMode } = GOOD_PROD;
    expect(environmentProblems(noMode)[0]).toMatch(/NODE_ENV/);
    expect(environmentProblems({ RAILWAY_ENVIRONMENT_NAME: "production" })[0]).toMatch(/dev-login/);
    expect(environmentProblems({ NODE_ENV: "development", WEB_ORIGIN: "https://app.example.com" })).toHaveLength(1);
    expect(() => assertSafeEnvironment({ RAILWAY_PROJECT_ID: "x" })).toThrow(/Refusing to start/);
  });

  it("requires an explicit HEALTH_API_MODE in production", () => {
    const { HEALTH_API_MODE: _omit, ...rest } = GOOD_PROD;
    expect(environmentProblems(rest)).toEqual([expect.stringMatching(/HEALTH_API_MODE/)]);
    expect(environmentProblems({ ...GOOD_PROD, HEALTH_API_MODE: "real" })).toEqual([]);
  });

  it("flags weak or malformed secrets and origins in production", () => {
    const problems = environmentProblems({
      ...GOOD_PROD,
      JWT_SECRET: "short",
      TOKEN_ENC_KEY: "zz",
      WEB_ORIGIN: "https://app.example.com/",
      GOOGLE_REDIRECT_URI: "http://api.example.com/cb",
    });
    expect(problems).toHaveLength(4);
  });

  it("never echoes secret values in its messages", () => {
    const secret = "s3cr3t-value-should-not-appear";
    const problems = environmentProblems({ ...GOOD_PROD, JWT_SECRET: secret, TOKEN_ENC_KEY: secret });
    expect(problems.join(" ")).not.toContain(secret);
  });
});
