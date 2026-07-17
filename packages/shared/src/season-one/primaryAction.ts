import type { DataConfidence, PrimaryActionId, WeekPhase } from "@one-step-ahead/shared";

export interface PrimaryAction {
  id: PrimaryActionId;
  title: string;
  body?: string;
  href?: string;
  priority: number;
}

export interface PrimaryActionInput {
  dataConfidence: DataConfidence;
  incompletePlayerCount: number;
  briefingAvailable: boolean;
  caseResultAvailable: boolean;
  phase: WeekPhase;
  suddenDeathActive: boolean;
  specialOperationActive: boolean;
  predictionActionAvailable: boolean;
  fieldOpsNearReward: boolean;
  nemesisClose: boolean;
  dailyTargetWithinReach: boolean;
}

export function selectPrimaryAction(input: PrimaryActionInput): PrimaryAction {
  if (input.dataConfidence === "incomplete" && input.incompletePlayerCount > 0) {
    return {
      id: "fix_sync",
      title: "Review sync status",
      body: "Some field reports are missing or stale.",
      href: "/profile",
      priority: 1,
    };
  }

  if (input.briefingAvailable) {
    return {
      id: "view_briefing",
      title: "Review assignment",
      body: "Open the Week 1 field briefing.",
      href: "/map",
      priority: 2,
    };
  }

  if (input.caseResultAvailable) {
    return {
      id: "view_case_result",
      title: "View case result",
      body: "The case file is ready.",
      href: "/map",
      priority: 3,
    };
  }

  if (input.suddenDeathActive || input.phase === "sudden_death") {
    return {
      id: "sudden_death",
      title: "Resolve sudden death",
      body: "Your nemesis duel needs one more verified day.",
      href: "/nemesis",
      priority: 4,
    };
  }

  if (input.specialOperationActive) {
    return {
      id: "special_operation",
      title: "Join the special operation",
      body: "The current operation can improve the chase.",
      href: "/map",
      priority: 5,
    };
  }

  if (input.predictionActionAvailable) {
    return {
      id: "submit_prediction",
      title: "Submit your prediction",
      body: "Make your sealed estimate for this week.",
      href: "/prediction",
      priority: 6,
    };
  }

  if (input.fieldOpsNearReward) {
    return {
      id: "field_ops_near_reward",
      title: "Open Field Ops",
      body: "A field milestone is within reach.",
      href: "/fieldops",
      priority: 7,
    };
  }

  if (input.nemesisClose) {
    return {
      id: "nemesis_close",
      title: "Check your rival",
      body: "Your nemesis matchup is close.",
      href: "/nemesis",
      priority: 8,
    };
  }

  if (input.dailyTargetWithinReach) {
    return {
      id: "daily_target",
      title: "Close today's gap",
      body: "Your daily target is within reach.",
      href: "/map",
      priority: 9,
    };
  }

  return {
    id: "continue_pursuit",
    title: "Continue the pursuit",
    body: "Every verified step closes the distance.",
    href: "/map",
    priority: 10,
  };
}
