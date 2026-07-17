import type { ParticipationThresholdOperationConfig } from "@one-step-ahead/shared/season-one/seasonOne";

export interface ParticipationThresholdState {
  id: string;
  label: string;
  active: boolean;
  contributors: number;
  eligiblePlayers: number;
  minimumVerifiedStepsPerPlayer: number;
  earnedBonus: number;
  maxBonus: number;
  /** Contributors needed to reach the next tier; null when the top tier is earned. */
  nextThresholdCount: number | null;
}

/**
 * Pure participation-threshold math (Platform Sweep). Contributor counting
 * from verified step logs stays with the caller; this converts counts into
 * the earned tier bonus so API, simulator, and demo share one formula.
 */
export function calculateParticipationThreshold(
  config: ParticipationThresholdOperationConfig,
  input: { contributors: number; eligiblePlayers: number; active: boolean },
): ParticipationThresholdState {
  const eligiblePlayers = Math.max(0, Math.floor(input.eligiblePlayers));
  const contributors = Math.min(Math.max(0, Math.floor(input.contributors)), eligiblePlayers || 0);
  const tiers = [...config.tiers].sort((a, b) => a.requiredRatio - b.requiredRatio);
  const maxBonus = tiers.length ? tiers[tiers.length - 1].bonus : 0;

  let earnedBonus = 0;
  let nextThresholdCount: number | null = null;
  if (eligiblePlayers > 0) {
    const ratio = contributors / eligiblePlayers;
    for (const tier of tiers) {
      if (ratio >= tier.requiredRatio) earnedBonus = tier.bonus;
    }
    const nextTier = tiers.find((tier) => tier.bonus > earnedBonus);
    nextThresholdCount = nextTier ? Math.ceil(nextTier.requiredRatio * eligiblePlayers) : null;
  }

  return {
    id: config.id,
    label: config.label,
    active: input.active,
    contributors,
    eligiblePlayers,
    minimumVerifiedStepsPerPlayer: config.minimumVerifiedStepsPerPlayer,
    earnedBonus,
    maxBonus,
    nextThresholdCount,
  };
}

/** The operation's local dates for a week starting on Monday `startsOn` (YYYY-MM-DD). */
export function operationWindowDates(
  config: ParticipationThresholdOperationConfig,
  startsOn: string,
): string[] {
  const dates: string[] = [];
  for (let day = config.startDay; day <= config.endDay; day += 1) {
    const d = new Date(`${startsOn}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + (day - 1)); // startDay 1 = Monday = starts_on
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}
