// Demo mode: when NEXT_PUBLIC_DEMO === "1" the app runs with no backend.
// `api()` resolves these baked fixtures instead of fetching, and the session
// provider auto-logs-in a demo detective. Used for the static GitHub Pages
// build so friends can click through every screen. No real data, no tokens.

import { SEASON_ONE_CONFIG, WEEK_ONE_CHICAGO, getEvidence } from "@one-step-ahead/shared/season-one/seasonOne";
import type { WeeklyOutcome } from "@one-step-ahead/shared";

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

const ME = {
  id: "demo-me",
  email: "you@selenaschase.demo",
  display_name: "You",
  group_id: "demo-group",
  weekly_step_target: 70000,
  avatar_skin: 5,
  avatar_hair: 5,
  avatar_colorway: 1,
  fitbit_connected: true,
  last_synced_at: "2026-06-12T18:50:00.000Z",
};

const MEMBERS = [
  { user_id: "demo-me", display_name: "You", avatar_skin: 5, avatar_hair: 5, avatar_colorway: 1 },
  { user_id: "demo-maya", display_name: "Maya", avatar_skin: 2, avatar_hair: 3, avatar_colorway: 2 },
  { user_id: "demo-jess", display_name: "Jess", avatar_skin: 4, avatar_hair: 6, avatar_colorway: 5 },
];

const CHICAGO = { id: 1, name: "Chicago", country: "USA", route_order: 1, background_image: null, lat: 41.8781, lng: -87.6298 };
const DETROIT = { id: 2, name: "Detroit", country: "USA", route_order: 2, background_image: null, lat: 42.3314, lng: -83.0458 };
const PITTSBURGH = { id: 3, name: "Pittsburgh", country: "USA", route_order: 3, background_image: null, lat: 40.4406, lng: -79.9959 };
const DC = { id: 4, name: "Washington, D.C.", country: "USA", route_order: 4, background_image: null, lat: 38.9072, lng: -77.0369 };
const NY = { id: 6, name: "New York City", country: "USA", route_order: 6, background_image: null, lat: 40.7128, lng: -74.006 };

const NY_LANDMARKS = [
  { id: 11, day: 1, name: "Brooklyn Bridge", fun_fact: "When it opened in 1883 it was the longest suspension bridge in the world." },
  { id: 12, day: 2, name: "Central Park", fun_fact: "It's entirely man-made — every pond, hill, and meadow was designed." },
  { id: 13, day: 3, name: "Times Square", fun_fact: "Named for The New York Times, which moved there in 1904." },
  { id: 14, day: 4, name: "Statue of Liberty", fun_fact: "Her full name is 'Liberty Enlightening the World.'" },
  { id: 15, day: 5, name: "Empire State Building", fun_fact: "It has its own ZIP code: 10118." },
  { id: 16, day: 6, name: "High Line", fun_fact: "Built on an abandoned elevated freight rail line." },
  { id: 17, day: 7, name: "Grand Central", fun_fact: "The ceiling's constellations are painted backwards." },
];

const CHICAGO_LANDMARKS = [
  { id: 1, day: 1, name: "Cloud Gate", fun_fact: "Locals call it 'The Bean.' It has no visible seams." },
  { id: 2, day: 2, name: "Willis Tower", fun_fact: "The glass Skydeck ledges extend 4.3 feet out over the street." },
  { id: 3, day: 3, name: "Navy Pier", fun_fact: "Its Centennial Wheel stands almost 200 feet tall." },
  { id: 4, day: 4, name: "Art Institute", fun_fact: "Its lion statues wear giant sports helmets during finals." },
  { id: 5, day: 5, name: "Wrigley Field", fun_fact: "The ivy on the outfield walls was planted in 1937." },
  { id: 6, day: 6, name: "Riverwalk", fun_fact: "The Chicago River is dyed green every St. Patrick's Day." },
  { id: 7, day: 7, name: "Buckingham Fountain", fun_fact: "One of the largest fountains in the world." },
];

const NY_STATE = ["unlocked", "unlocked", "unlocked", "unlocked", "today", "locked", "locked"];

// The fixed Week 1 Chicago board (migration 008 definitions): 24 configured
// tiles + the free space, in the shared deterministic layout's spirit.
function bingoTiles() {
  const tiles: Array<{ label: string; icon: string; category: string; source: "auto" | "honor"; state: string; gifted?: boolean }> = [
    { label: "First Footfall: 1,000 steps in a day", icon: "step", category: "steps", source: "auto", state: "complete" },
    { label: "Morning Surveillance: 1,000 before noon", icon: "clock", category: "steps", source: "auto", state: "complete" },
    { label: "Send Backup: gift a tile assist", icon: "nemesis", category: "social", source: "auto", state: "incomplete" },
    { label: "On the Move: 5,000 steps in a day", icon: "step", category: "steps", source: "auto", state: "complete" },
    { label: "Full Shift: 100% of daily target", icon: "flame", category: "steps", source: "auto", state: "in_progress" },
    { label: "Closing Distance: 50% of daily target", icon: "flame", category: "steps", source: "auto", state: "complete" },
    { label: "Keep the Trail: 2,000 steps two days running", icon: "step", category: "steps", source: "auto", state: "complete" },
    { label: "Split Shift: 1,000 morning + 1,000 evening", icon: "clock", category: "steps", source: "auto", state: "incomplete" },
    { label: "Steady Signal: 500 steps on five days", icon: "step", category: "steps", source: "auto", state: "in_progress" },
    { label: "Take the Long Way: add movement to a trip", icon: "star", category: "steps", source: "honor", state: "incomplete" },
    { label: "Hot Pursuit: 10,000 steps in a day", icon: "step", category: "steps", source: "auto", state: "complete" },
    { label: "After-Hours Watch: 1,000 after 6pm", icon: "clock", category: "steps", source: "auto", state: "incomplete" },
    { label: "FREE", icon: "star", category: "wildcard", source: "auto", state: "complete" },
    { label: "Unit Mobilized: 3 operatives hit 50% today", icon: "globe", category: "social", source: "auto", state: "complete" },
    { label: "Eyes Up: notice a new detail around you", icon: "star", category: "wildcard", source: "honor", state: "incomplete" },
    { label: "City Sweep: 15,000 steps this week", icon: "globe", category: "steps", source: "auto", state: "complete" },
    { label: "Accept Backup: receive a tile assist", icon: "nemesis", category: "social", source: "auto", state: "complete", gifted: true },
    { label: "8,000 steps in a day", icon: "step", category: "steps", source: "auto", state: "complete" },
    { label: "Three-Day Tail: steps three days running", icon: "step", category: "steps", source: "auto", state: "in_progress" },
    { label: "Walk With Someone: friend, family, or pet", icon: "nemesis", category: "social", source: "honor", state: "incomplete" },
    { label: "No Cold Trail: steps every day this week", icon: "step", category: "steps", source: "auto", state: "incomplete" },
    { label: "Full Team Report: everyone syncs in 24h", icon: "globe", category: "social", source: "auto", state: "complete" },
    { label: "12,000 steps in a day", icon: "step", category: "steps", source: "auto", state: "incomplete" },
    { label: "Choose the Longer Route when safe", icon: "star", category: "steps", source: "honor", state: "incomplete" },
    { label: "Log any workout today", icon: "workout", category: "workout", source: "auto", state: "incomplete" },
  ];
  return tiles.map((tile, i) => ({
    challenge_id: i,
    label: tile.label,
    icon: tile.icon,
    category: tile.category,
    source: tile.source,
    state: tile.state,
    free: i === 12 ? true : undefined,
    gifted_by: tile.gifted ? "demo-maya" : undefined,
    completed_at: null,
  }));
}

const NOTIFICATIONS = [
  { id: 1, kind: "beat", message: "Every operative in motion. She's checking over her shoulder.", read: false, created_at: "2026-06-12T18:15:00Z" },
  { id: 2, kind: "achievement", message: "You unlocked the Statue of Liberty!", read: false, created_at: "2026-06-12T18:00:00Z" },
  { id: 3, kind: "social", message: "Maya just passed you on the leaderboard.", read: false, created_at: "2026-06-12T15:30:00Z" },
];

function leaderboard() {
  return [
    { rank: 1, ...MEMBERS[2], steps: 79062, deltaVsLastWeek: 4120 },
    { rank: 2, ...MEMBERS[1], steps: 67845, deltaVsLastWeek: -1850 },
    { rank: 3, ...MEMBERS[0], steps: 50058, deltaVsLastWeek: 6310 },
  ];
}

function progressStrip() {
  return MEMBERS.map((m, i) => {
    const steps = [50058, 67845, 79062][i];
    return { ...m, steps, target: 70000, pct: Math.min(100, Math.round((steps / 70000) * 100)) };
  });
}

const WEEK = {
  id: "demo-week-chicago",
  starts_on: "2026-06-08",
  ends_on: "2026-06-14",
  group_target_steps: 210000,
  status: "active" as const,
};

const DEMO_OUTCOME: WeeklyOutcome = "close_encounter";

function evidenceSlot(evidenceId: string, kind: "standard" | "intercept", unlocked: boolean) {
  const evidence = getEvidence(evidenceId);
  return {
    id: evidenceId,
    kind,
    title: unlocked && evidence ? evidence.title : kind === "standard" ? "SEALED EVIDENCE" : "INTERCEPT CLUE",
    body: unlocked && evidence ? evidence.enhancedBody ?? evidence.body : null,
    highlightedFragment: unlocked && evidence ? evidence.highlightedFragment ?? null : null,
    iconKey: unlocked && evidence ? evidence.iconKey ?? null : null,
    unlocked,
    unlockedAt: unlocked ? "2026-06-15T06:05:00.000Z" : null,
  };
}

function evidenceBoard() {
  return {
    season: {
      id: SEASON_ONE_CONFIG.id,
      title: SEASON_ONE_CONFIG.title,
      totalWeeks: SEASON_ONE_CONFIG.route.length,
    },
    interceptionCount: 0,
    finaleDepthTier: 1,
    weeks: SEASON_ONE_CONFIG.route.map((week) => {
      const weekOne = week.weekNumber === 1;
      return {
        weekNumber: week.weekNumber,
        cityName: week.cityName,
        chapterTitle: week.chapterTitle,
        outcome: weekOne ? DEMO_OUTCOME : null,
        standardEvidence: evidenceSlot(week.evidence.standardEvidenceId, "standard", weekOne),
        interceptClue: evidenceSlot(week.evidence.interceptClueId, "intercept", false),
      };
    }),
  };
}

const FIXTURES: Record<string, unknown> = {
  "/api/auth/session": {
    user: ME,
    group: { id: "demo-group", name: "The Night Walkers", invite_code: "SELENA", admin_id: "demo-me" },
    activeWeek: WEEK,
  },
  "/api/users/me": { user: ME },
  "/api/users/me/stats": {
    total_steps_alltime: 1284502,
    total_steps_this_week: 50058,
    city_wins: 2,
    bingo_lines_alltime: 7,
    current_streak: 2,
  },
  "/api/groups/me": {
    group: { id: "demo-group", name: "The Night Walkers", invite_code: "SELENA", admin_id: "demo-me", timezone: "America/Chicago" },
    members: MEMBERS.map((m) => ({ id: m.user_id, ...m })),
  },
  "/api/weeks/current": {
    week: WEEK,
    city: CHICAGO,
    nextCity: DETROIT,
    selenaLeadSteps: 9885,
    route: [
      { city_id: 1, name: "Chicago", visited: false },
      { city_id: 2, name: "Detroit", visited: false },
      { city_id: 3, name: "Pittsburgh", visited: false },
      { city_id: 4, name: "Washington, D.C.", visited: false },
    ],
    progressStrip: progressStrip(),
    leaderboard: leaderboard(),
    countdown: "2026-06-15T05:00:00Z",
    lastSyncedAt: "2026-06-12T18:50:00Z",
    seasonState: {
      season: {
        id: SEASON_ONE_CONFIG.id,
        title: SEASON_ONE_CONFIG.title,
        weekNumber: 1,
        totalWeeks: SEASON_ONE_CONFIG.route.length,
      },
      chapter: {
        city: WEEK_ONE_CHICAGO.cityName,
        title: WEEK_ONE_CHICAGO.chapterTitle,
        complication: WEEK_ONE_CHICAGO.complication.label,
        nextCity: WEEK_ONE_CHICAGO.nextCityTeaser.cityName,
      },
      phase: "final_push",
      dataConfidence: "verified",
      chase: {
        verifiedGroupSteps: 196965,
        snapshottedTarget: 210000,
        baseProgress: 0.9379285714285714,
        fieldOpsBonus: 0,
        specialOperationBonus: 0,
        nemesisParticipationBonus: 0.005,
        predictionParticipationBonus: 0.01,
        totalNonStepBonus: 0.015,
        finalProgress: 0.9529285714285715,
        remainingLead: 9885,
        projectedOutcome: "close_encounter",
        finalOutcome: null,
      },
      primaryAction: {
        id: "continue_pursuit",
        title: "Continue the pursuit",
        body: "Every verified step closes the distance.",
        href: "/map",
        priority: 10,
      },
      primaryBeat: {
        id: "final_push_close_encounter",
        category: "ritual",
        headline: "FINAL PUSH",
        body: "Selena is close enough to become inconvenient. Field Ops and the Platform Sweep can still close the last gap.",
        selena: "You are close enough to become inconvenient.",
        ctaLabel: "Review the pursuit",
        ctaHref: "/map",
        dataConfidence: "verified",
      },
      platformSweep: {
        id: WEEK_ONE_CHICAGO.specialOperation.id,
        label: WEEK_ONE_CHICAGO.specialOperation.label,
        active: true,
        contributors: 2,
        eligiblePlayers: 3,
        minimumVerifiedStepsPerPlayer: WEEK_ONE_CHICAGO.specialOperation.minimumVerifiedStepsPerPlayer,
        earnedBonus: 0.02,
        maxBonus: 0.03,
        nextThresholdCount: 3,
      },
      evidencePreview: {
        standardEvidenceId: WEEK_ONE_CHICAGO.evidence.standardEvidenceId,
        standardTitle: null,
        unlocked: false,
        interceptUnlocked: false,
      },
      ritualViews: {
        mondayBriefing: true,
        midweekUpdate: true,
        finalPush: false,
        caseClosed: false,
      },
      previousCase: null,
      sync: {
        lastUpdatedAt: "2026-06-12T18:50:00Z",
        incompletePlayerCount: 0,
        stalePlayerCount: 0,
      },
    },
    state: "in_progress",
  },
  "/api/cities/current": {
    city: CHICAGO,
    landmarks: CHICAGO_LANDMARKS.map((l, i) => ({ ...l, image: null, state: NY_STATE[i] })),
    groupWorkout: {
      total_members: 3,
      worked_out_today: 2,
      members: MEMBERS.map((m, i) => ({ ...m, worked_out: i !== 0 })),
    },
  },
  // Historical trophy view retained for existing routes.
  "/api/cities/1": {
    city: CHICAGO,
    week: { starts_on: "2026-06-01", ends_on: "2026-06-07", group_target_steps: 210000, group_total_steps: 234500, target_hit: true },
    landmarks: CHICAGO_LANDMARKS.map((l, i) => ({ ...l, image: null, earned: i < 5 })),
    unlocked_count: 5,
    champion: { user_id: "demo-me", display_name: "You", avatar_skin: 5, avatar_hair: 5, avatar_colorway: 1, quality: "silver" },
  },
  "/api/predictions/current": {
    week: WEEK,
    city: { name: "Chicago" },
    myPrediction: {
      user_id: "demo-me", predicted_steps: 102000, submitted_at: "2026-06-08T14:00:00Z",
      actual_delta: null, is_winner: false, display_name: "You", avatar_skin: 5, avatar_hair: 5, avatar_colorway: 1,
    },
    others: [
      { user_id: "demo-maya", predicted_steps: 109000, submitted_at: "2026-06-08T15:00:00Z", actual_delta: null, is_winner: false, display_name: "Maya", avatar_skin: 2, avatar_hair: 3, avatar_colorway: 2 },
      { user_id: "demo-jess", predicted_steps: 116000, submitted_at: "2026-06-08T16:00:00Z", actual_delta: null, is_winner: false, display_name: "Jess", avatar_skin: 4, avatar_hair: 6, avatar_colorway: 5 },
    ],
    allSubmitted: true,
    liveGroupTotal: 196965,
    revealAt: "2026-06-08T17:00:00Z",
    state: "revealed",
    submissionOpen: false,
  },
  "/api/bingo/current": {
    card: { id: "demo-card", tiles: bingoTiles(), bingo_lines: 2, blackout: false, frozen: false },
    friends: [
      { ...MEMBERS[1], bingo_lines: 1, blackout: false },
      { ...MEMBERS[2], bingo_lines: 3, blackout: false },
    ],
  },
  "/api/fieldops": {
    card: { id: "demo-card", tiles: bingoTiles(), bingo_lines: 2, blackout: false, frozen: false },
    scout: {
      reconCity: { id: 2, name: "Detroit", country: "USA" },
      teamTokens: 6,
      unlockedCount: 3,
      overflowBonus: 1,
      unlockedToday: true,
    },
    reconCity: { id: 2, name: "Detroit", country: "USA" },
    intel: [
      { id: 31, day: 1, name: "The Capitol Dome", fun_fact: "Her comm intercepts reference 'the iron dome that grew twice.'", image: null, unlocked: true, unlock_date: "2026-06-10", scouted_by_id: "demo-jess", scouted_by: "Jess" },
      { id: 32, day: 2, name: "Lincoln Memorial", fun_fact: "A courier saw a sky-blue fedora on the marble steps at dawn.", image: null, unlocked: true, unlock_date: "2026-06-11", scouted_by_id: "demo-me", scouted_by: "You" },
      { id: 33, day: 3, name: "The Washington Monument", fun_fact: "Its shadow marks a dead-drop only at 12 noon.", image: null, unlocked: true, unlock_date: "2026-06-12", scouted_by_id: "demo-maya", scouted_by: "Maya" },
      { id: 34, day: 4, name: "Smithsonian Castle", fun_fact: null, image: null, unlocked: false, unlock_date: null, scouted_by_id: null, scouted_by: null },
      { id: 35, day: 5, name: "Georgetown Canal", fun_fact: null, image: null, unlocked: false, unlock_date: null, scouted_by_id: null, scouted_by: null },
    ],
    assists: { remaining: 1 },
    teammates: [
      { ...MEMBERS[1], bingo_lines: 1, blackout: false },
      { ...MEMBERS[2], bingo_lines: 3, blackout: false },
    ],
  },
  "/api/fieldops/dossier": {
    owner: { id: "demo-me", display_name: "You" },
    cards: [
      { id: "ic-3", variant: "scouted", created_at: "2026-06-12T14:00:00Z", landmark_id: 33, landmark_name: "The Washington Monument", fun_fact: "Its shadow marks a dead-drop only at 12 noon.", image: null, city_id: 3, city_name: "Washington, D.C.", city_country: "USA" },
      { id: "ic-2", variant: "scouted", created_at: "2026-06-04T09:00:00Z", landmark_id: 11, landmark_name: "Brooklyn Bridge", fun_fact: "When it opened in 1883 it was the longest suspension bridge in the world.", image: null, city_id: 2, city_name: "New York", city_country: "USA" },
      { id: "ic-1", variant: "confirmed", created_at: "2026-05-28T20:00:00Z", landmark_id: 2, landmark_name: "Willis Tower Skydeck", fun_fact: "The Ledge's glass boxes extend 4.3 feet out on the 103rd floor.", image: null, city_id: 1, city_name: "Chicago", city_country: "USA" },
    ],
    cities: [
      ...CHICAGO_LANDMARKS.slice(0, 5).map((l) => ({ id: CHICAGO.id, name: CHICAGO.name, country: CHICAGO.country, landmark_id: l.id, day: l.day, landmark_name: l.name, fun_fact: l.fun_fact, image: null })),
      ...NY_LANDMARKS.slice(0, 5).map((l) => ({ id: NY.id, name: NY.name, country: NY.country, landmark_id: l.id, day: l.day, landmark_name: l.name, fun_fact: l.fun_fact, image: null })),
      ...[
        { id: 31, day: 1, name: "The Capitol Dome", fun_fact: "Her comm intercepts reference 'the iron dome that grew twice.'" },
        { id: 32, day: 2, name: "Lincoln Memorial", fun_fact: "A courier saw a sky-blue fedora on the marble steps at dawn." },
        { id: 33, day: 3, name: "The Washington Monument", fun_fact: "Its shadow marks a dead-drop only at 12 noon." },
        { id: 34, day: 4, name: "Smithsonian Castle", fun_fact: null },
        { id: 35, day: 5, name: "Georgetown Canal", fun_fact: null },
      ].map((l) => ({ id: DC.id, name: DC.name, country: DC.country, landmark_id: l.id, day: l.day, landmark_name: l.name, fun_fact: l.fun_fact, image: null })),
    ],
  },
  "/api/bingo/friends": {
    friends: [
      { ...MEMBERS[1], bingo_lines: 1, blackout: false },
      { ...MEMBERS[2], bingo_lines: 3, blackout: false },
    ],
  },
  "/api/nemesis/current": {
    matchup: {
      id: "demo-matchup", week_id: "demo-week-dc", player_a: "demo-me", player_b: "demo-maya",
      status: "active", score_a: 0, score_b: 0, tiebreaker_date: null,
      rerolled: false, winner_id: null,
      daily_results: [],
    },
    you: { ...MEMBERS[0], steps_today: 0, steps_this_week: 0 },
    nemesis: { ...MEMBERS[1], steps_today: 0, steps_this_week: 0 },
    week: { starts_on: "2026-06-15", ends_on: "2026-06-21" },
    today: "2026-06-14",
    weekMax: 0,
    outcome: null,
    state: "scheduled",
  },
  "/api/badges": {
    badges: [
      { id: "b1", code: "city", label: "City Champion", description: "Top stepper when the team cleared a city.", quality: "silver", city_id: 1, city_name: "Chicago", earned_at: "2026-06-07T23:00:00Z" },
      { id: "b2", code: "prediction_win", label: "Oracle", description: "Closest call on the weekly total.", quality: null, city_id: null, city_name: null, earned_at: "2026-06-07T23:00:00Z" },
      { id: "b3", code: "bingo", label: "Bingo", description: "Completed a line on your card.", quality: "bronze", city_id: null, city_name: null, earned_at: "2026-05-31T23:00:00Z" },
      { id: "b4", code: "nemesis_victor", label: "Nemesis Victor", description: "Won your weekly duel.", quality: "gold", city_id: null, city_name: null, earned_at: "2026-05-24T23:00:00Z" },
    ],
  },
  "/api/notifications": { notifications: NOTIFICATIONS },
  "/api/evidence": evidenceBoard(),
};

/** Resolve a fixture for a GET path, or null if none (caller falls through). */
export function demoResponse<T>(path: string): T | null {
  const clean = path.split("?")[0];
  if (clean in FIXTURES) return FIXTURES[clean] as T;
  // History endpoint, etc. — safe empty defaults.
  if (clean === "/api/predictions/history") return { history: [], wins: 2 } as T;
  return null;
}

/** POST/PATCH/DELETE in demo mode: succeed, with just enough in-memory
    state that the UI behaves like production. Resets on reload — a fresh
    demo visit gets its toasts back. */
export function demoMutation<T>(path?: string, body?: BodyInit | null): T {
  // Notification toasts auto-mark read after 5s; without this the demo
  // showed the same two "unread" toasts forever, covering every screen.
  if (path?.split("?")[0] === "/api/notifications/read" && typeof body === "string") {
    try {
      const ids: number[] = JSON.parse(body).ids ?? [];
      for (const n of NOTIFICATIONS) if (ids.includes(n.id)) n.read = true;
    } catch {
      // malformed body — demo mutations still succeed silently
    }
  }
  return { ok: true, viewed_at: new Date().toISOString() } as T;
}
