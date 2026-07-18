import type { DataConfidence, WeekPhase, WeeklyOutcome } from "@one-step-ahead/shared";

export interface WeeklyPhaseInput {
  startsOn: string;
  endsOn: string;
  timezone: string;
  weekStatus: "scheduled" | "active" | "closed";
  finalOutcome: WeeklyOutcome | null;
  finalizedAt: Date | string | null;
  dataConfidence: DataConfidence;
  briefingViewed: boolean;
  midweekViewed: boolean;
  finalPushViewed: boolean;
  caseClosedViewed?: boolean;
  suddenDeathActive: boolean;
  now: Date | string;
}

export interface WeeklyPhaseResult {
  phase: WeekPhase;
  shouldShowModal: "monday_briefing" | "midweek_update" | "final_push" | "case_closed" | null;
}

interface LocalDateTimeParts {
  date: string;
  weekday: number;
  minutesAfterMidnight: number;
}

const WEDNESDAY = 3;
const FRIDAY = 5;
const SATURDAY = 6;
const NOON = 12 * 60;
const FINAL_PUSH_START = 8 * 60;
const SUNDAY_CUTOFF = (23 * 60) + 59;

export function calculateWeeklyPhase(input: WeeklyPhaseInput): WeeklyPhaseResult {
  const local = localDateTimeParts(input.now, input.timezone);

  if (input.weekStatus === "closed" && input.finalOutcome) {
    return {
      phase: "case_closed",
      shouldShowModal: input.caseClosedViewed ? null : "case_closed",
    };
  }

  if (isAfterSundayCutoff(local, input.endsOn) || input.dataConfidence === "recalculating") {
    return { phase: "case_closing", shouldShowModal: null };
  }

  if (input.suddenDeathActive && local.weekday === SATURDAY) {
    return { phase: "sudden_death", shouldShowModal: null };
  }

  if (isFinalPush(local, input.endsOn)) {
    return {
      phase: "final_push",
      shouldShowModal: input.finalPushViewed ? null : "final_push",
    };
  }

  if (isMidweekUpdate(local)) {
    return {
      phase: "midweek_update",
      shouldShowModal: input.midweekViewed ? null : "midweek_update",
    };
  }

  if (local.date === input.startsOn && !input.briefingViewed) {
    return { phase: "briefing", shouldShowModal: "monday_briefing" };
  }

  return { phase: "active", shouldShowModal: null };
}

export function localDateTimeParts(now: Date | string, timeZone: string): LocalDateTimeParts {
  const date = new Date(now);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const normalizedHour = get("hour") === "24" ? 0 : Number(get("hour"));

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: weekdayIndex(get("weekday")),
    minutesAfterMidnight: (normalizedHour * 60) + Number(get("minute")),
  };
}

function isAfterSundayCutoff(local: LocalDateTimeParts, endsOn: string): boolean {
  if (local.date > endsOn) return true;
  return local.date === endsOn && local.minutesAfterMidnight >= SUNDAY_CUTOFF;
}

function isFinalPush(local: LocalDateTimeParts, endsOn: string): boolean {
  if (local.date > endsOn) return false;
  if (local.weekday === FRIDAY && local.minutesAfterMidnight >= FINAL_PUSH_START) return true;
  return local.weekday === SATURDAY || local.date === endsOn;
}

function isMidweekUpdate(local: LocalDateTimeParts): boolean {
  if (local.weekday === WEDNESDAY) return local.minutesAfterMidnight >= NOON;
  if (local.weekday === 4) return true;
  if (local.weekday === FRIDAY) return local.minutesAfterMidnight < FINAL_PUSH_START;
  return false;
}

function weekdayIndex(weekday: string): number {
  const weekdays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return weekdays[weekday] ?? 0;
}
