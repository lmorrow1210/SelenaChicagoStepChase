// Health-API timestamps (workout start, bedtime) are true UTC instants. The
// bingo time-of-day detectors (`workout_before`, `bedtime_before`) compare
// wall-clock hours, and their contract is "group-local time expressed as Z".
// This is the one place that converts between the two.
//
// TODO(smoke-test): the Health API may carry a per-interval `startUtcOffset`.
// If the owner's smoke output confirms it, prefer that offset (it follows a
// travelling player) and fall back to the group zone used here.

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let fmt = formatters.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, fmt);
  }
  return fmt;
}

/**
 * Re-express a UTC instant as the wall-clock time in `timeZone`, written with
 * a `Z` suffix (e.g. 2026-11-03T04:45:00Z in America/Chicago →
 * "2026-11-02T22:45:00Z"). DST-correct per instant. Returns null for a
 * missing or unparseable instant, or an unknown zone.
 */
export function toLocalAsZ(instant: string | Date | null | undefined, timeZone: string): string | null {
  if (instant == null) return null;
  const d = instant instanceof Date ? instant : new Date(instant);
  if (Number.isNaN(d.getTime())) return null;
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = formatterFor(timeZone).formatToParts(d);
  } catch {
    return null;
  }
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`;
}
