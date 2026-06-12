import { describe, expect, it } from "vitest";
import { withBackoff, RetryableError, isRetryable } from "../src/lib/backoff.js";
import { localClock, isSyncHour } from "../src/services/cron.js";

const noSleep = async () => {};

function failNTimes<T>(n: number, result: T): { fn: () => Promise<T>; calls: () => number } {
  let calls = 0;
  return {
    fn: async () => {
      calls++;
      if (calls <= n) {
        const err = new Error("429") as Error & { status: number };
        err.status = 429;
        throw err;
      }
      return result;
    },
    calls: () => calls,
  };
}

describe("withBackoff (plan §5: 429 storm)", () => {
  it("succeeds after transient 429s", async () => {
    const { fn, calls } = failNTimes(3, "ok");
    const result = await withBackoff(fn, { sleep: noSleep });
    expect(result).toBe("ok");
    expect(calls()).toBe(4);
  });

  it("gives up after 5 tries and rethrows the last 429", async () => {
    const { fn, calls } = failNTimes(99, "never");
    await expect(withBackoff(fn, { sleep: noSleep })).rejects.toThrow("429");
    expect(calls()).toBe(5);
  });

  it("rethrows non-retryable errors immediately", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      throw new Error("boom");
    };
    await expect(withBackoff(fn, { sleep: noSleep })).rejects.toThrow("boom");
    expect(calls).toBe(1);
  });

  it("delays follow exponential ceilings with jitter (1s→32s cap)", async () => {
    const delays: number[] = [];
    const { fn } = failNTimes(99, "never");
    await withBackoff(fn, {
      tries: 7,
      sleep: async (ms) => {
        delays.push(ms);
      },
      rand: () => 1, // jitter at the ceiling so we can assert exact bounds
    }).catch(() => {});
    expect(delays).toEqual([1001, 2001, 4001, 8001, 16001, 32001]);
  });

  it("classifies RetryableError and 429/503 statuses", () => {
    expect(isRetryable(new RetryableError("x"))).toBe(true);
    expect(isRetryable(Object.assign(new Error("x"), { status: 429 }))).toBe(true);
    expect(isRetryable(Object.assign(new Error("x"), { status: 503 }))).toBe(true);
    expect(isRetryable(Object.assign(new Error("x"), { status: 500 }))).toBe(false);
    expect(isRetryable(new Error("x"))).toBe(false);
  });
});

describe("cron scheduling helpers", () => {
  it("localClock returns hour/date/weekday in the group timezone", () => {
    // 2026-06-12T05:30:00Z is 00:30 Friday in Chicago (CDT, UTC-5)
    const now = new Date("2026-06-12T05:30:00Z");
    const chicago = localClock(now, "America/Chicago");
    expect(chicago).toEqual({ hour: 0, date: "2026-06-12", weekday: 5 });

    // Same instant is 14:30 Friday in Tokyo (UTC+9)
    const tokyo = localClock(now, "Asia/Tokyo");
    expect(tokyo).toEqual({ hour: 14, date: "2026-06-12", weekday: 5 });
  });

  it("localClock identifies Monday midnight for rollover", () => {
    // 2026-06-15T05:00:00Z = Monday 00:00 in Chicago
    const clock = localClock(new Date("2026-06-15T05:00:00Z"), "America/Chicago");
    expect(clock.hour).toBe(0);
    expect(clock.weekday).toBe(1);
  });

  it("isSyncHour matches noon, 6pm, midnight only", () => {
    expect(isSyncHour(0)).toBe(true);
    expect(isSyncHour(12)).toBe(true);
    expect(isSyncHour(18)).toBe(true);
    expect(isSyncHour(6)).toBe(false);
    expect(isSyncHour(23)).toBe(false);
  });
});
