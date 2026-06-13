// Demo mode: when NEXT_PUBLIC_DEMO === "1" the app runs with no backend.
// `api()` resolves these baked fixtures instead of fetching, and the session
// provider auto-logs-in a demo detective. Used for the static GitHub Pages
// build so friends can click through every screen. No real data, no tokens.

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

const NY = { id: 2, name: "New York", country: "USA", route_order: 2, background_image: null, lat: 40.7128, lng: -74.006 };
const CHICAGO = { id: 1, name: "Chicago", country: "USA", route_order: 1, background_image: null, lat: 41.8781, lng: -87.6298 };
const REYKJAVIK = { id: 3, name: "Reykjavik", country: "Iceland", route_order: 3, background_image: null, lat: 64.1466, lng: -21.9426 };

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

function bingoTiles() {
  const labels = [
    "10k steps", "Morning walk", "Beat your nemesis", "2 workouts", "8h sleep",
    "Hit your target", "Stairs day", "Cardio zone", "Step streak ×3", "Lunch walk",
    "15k steps", "Evening jog", "FREE", "Peak HR zone", "No-elevator day",
    "Sunrise steps", "30 active min", "Outpace Selena", "Weekend long walk", "12k steps",
    "Hydrate + move", "Group workout", "5k before noon", "Bedtime by 11", "Hot pursuit",
  ];
  const done = new Set([0, 1, 2, 5, 6, 9, 12, 13, 16, 19]);
  return labels.map((label, i) => ({
    challenge_id: i,
    label,
    icon: i % 3 === 0 ? "step" : i % 3 === 1 ? "workout" : "flame",
    state: i === 12 ? "complete" : done.has(i) ? "complete" : i % 4 === 0 ? "in_progress" : "incomplete",
    free: i === 12 ? true : undefined,
    completed_at: null,
  }));
}

const NOTIFICATIONS = [
  { id: 1, kind: "achievement", message: "You unlocked the Statue of Liberty!", read: false, created_at: "2026-06-12T18:00:00Z" },
  { id: 2, kind: "social", message: "Maya just passed you on the leaderboard.", read: false, created_at: "2026-06-12T15:30:00Z" },
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
  id: "demo-week-ny",
  starts_on: "2026-06-08",
  ends_on: "2026-06-14",
  group_target_steps: 210000,
  status: "active" as const,
};

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
    city: NY,
    nextCity: REYKJAVIK,
    selenaLeadSteps: 13035,
    route: [
      { city_id: 1, name: "Chicago", visited: true },
      { city_id: 2, name: "New York", visited: false },
      { city_id: 3, name: "Reykjavik", visited: false },
    ],
    progressStrip: progressStrip(),
    leaderboard: leaderboard(),
    countdown: "2026-06-15T05:00:00Z",
    lastSyncedAt: "2026-06-12T18:50:00Z",
    state: "in_progress",
  },
  "/api/cities/current": {
    city: NY,
    landmarks: NY_LANDMARKS.map((l, i) => ({ ...l, image: null, state: NY_STATE[i] })),
    groupWorkout: {
      total_members: 3,
      worked_out_today: 2,
      members: MEMBERS.map((m, i) => ({ ...m, worked_out: i !== 0 })),
    },
  },
  // Chicago is the completed trophy view.
  "/api/cities/1": {
    city: CHICAGO,
    week: { starts_on: "2026-06-01", ends_on: "2026-06-07", group_target_steps: 210000, group_total_steps: 234500, target_hit: true },
    landmarks: CHICAGO_LANDMARKS.map((l, i) => ({ ...l, image: null, earned: i < 5 })),
    unlocked_count: 5,
    champion: { user_id: "demo-me", display_name: "You", avatar_skin: 5, avatar_hair: 5, avatar_colorway: 1, quality: "silver" },
  },
  "/api/predictions/current": {
    week: WEEK,
    city: { name: "New York" },
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
  "/api/bingo/friends": {
    friends: [
      { ...MEMBERS[1], bingo_lines: 1, blackout: false },
      { ...MEMBERS[2], bingo_lines: 3, blackout: false },
    ],
  },
  "/api/nemesis/current": {
    matchup: {
      id: "demo-matchup", week_id: "demo-week-ny", player_a: "demo-me", player_b: "demo-maya",
      status: "active", score_a: 2, score_b: 1, tiebreaker_date: null, reroll_used: false,
      daily_results: [
        { date: "2026-06-08", a_steps: 9200, b_steps: 8100, winner: "a" },
        { date: "2026-06-09", a_steps: 7400, b_steps: 11200, winner: "b" },
        { date: "2026-06-10", a_steps: 12800, b_steps: 9050, winner: "a" },
        { date: "2026-06-11", a_steps: 8600, b_steps: 8600, winner: "tie" },
      ],
    },
    you: MEMBERS[0],
    nemesis: MEMBERS[1],
    week: { starts_on: "2026-06-08", ends_on: "2026-06-14" },
    today: "2026-06-12",
    weekMax: 12800,
    outcome: null,
    state: "active",
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
};

/** Resolve a fixture for a GET path, or null if none (caller falls through). */
export function demoResponse<T>(path: string): T | null {
  const clean = path.split("?")[0];
  if (clean in FIXTURES) return FIXTURES[clean] as T;
  // History endpoint, etc. — safe empty defaults.
  if (clean === "/api/predictions/history") return { history: [], wins: 2 } as T;
  return null;
}

/** POST/PATCH/DELETE in demo mode: succeed without doing anything. */
export function demoMutation<T>(): T {
  return { ok: true } as T;
}
