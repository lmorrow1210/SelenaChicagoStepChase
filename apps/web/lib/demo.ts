// Demo mode: when NEXT_PUBLIC_DEMO === "1" the app runs with no backend.
// `api()` resolves these baked fixtures instead of fetching, and the session
// provider auto-logs-in a demo detective. Used for the static GitHub Pages
// build so friends can click through every screen. No real data, no tokens.

import {
  SEASON_ONE_CONFIG,
  WEEK_ONE_CHICAGO,
  getEvidence,
  getSeasonWeek,
  type SeasonWeekConfig,
} from "@one-step-ahead/shared/season-one/seasonOne";
import { calculateChase } from "@one-step-ahead/shared/season-one/chase";
import { selectPrimaryAction } from "@one-step-ahead/shared/season-one/primaryAction";
import { selectPrimaryBeat } from "@one-step-ahead/shared/season-one/primaryBeat";
import { calculateParticipationThreshold } from "@one-step-ahead/shared/season-one/specialOperations";
import type { WeeklyOutcome } from "@one-step-ahead/shared";

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
export const DEMO_WEEK_NUMBER = parseDemoWeekNumber(process.env.NEXT_PUBLIC_DEMO_WEEK);

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

const CITY_COORDS: Record<number, { lat: number; lng: number }> = {
  1: { lat: 41.8781, lng: -87.6298 },
  2: { lat: 42.3314, lng: -83.0458 },
  3: { lat: 40.4406, lng: -79.9959 },
  4: { lat: 38.9072, lng: -77.0369 },
  5: { lat: 39.9526, lng: -75.1652 },
  6: { lat: 40.7128, lng: -74.006 },
  7: { lat: 42.3601, lng: -71.0589 },
  8: { lat: 32.0809, lng: -81.0912 },
  9: { lat: 29.9511, lng: -90.0715 },
  10: { lat: 30.2672, lng: -97.7431 },
  11: { lat: 35.687, lng: -105.9378 },
  12: { lat: 34.0522, lng: -118.2437 },
  13: { lat: 37.7749, lng: -122.4194 },
};

function parseDemoWeekNumber(value: string | undefined): number {
  const parsed = Number(value ?? 1);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= SEASON_ONE_CONFIG.route.length
    ? parsed
    : 1;
}

function demoWeekConfig(weekNumber = DEMO_WEEK_NUMBER): SeasonWeekConfig {
  return getSeasonWeek(weekNumber) ?? WEEK_ONE_CHICAGO;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function weekStartsOn(weekNumber: number): string {
  return addDays("2026-06-08", (weekNumber - 1) * 7);
}

function cityFixture(week: SeasonWeekConfig) {
  const coords = CITY_COORDS[week.weekNumber]!;
  return {
    id: week.weekNumber,
    name: week.cityName,
    country: "USA",
    route_order: week.weekNumber,
    background_image: null,
    lat: coords.lat,
    lng: coords.lng,
  };
}

const ROUTE_CITIES = SEASON_ONE_CONFIG.route.map(cityFixture);
const CHICAGO = ROUTE_CITIES[0]!;
const DETROIT = ROUTE_CITIES[1]!;

const MEMBER_WEEK_STEPS = [50058, 67845, 79062];
const DEMO_GROUP_STEPS = MEMBER_WEEK_STEPS.reduce((sum, steps) => sum + steps, 0);

const CHICAGO_LANDMARKS = [
  { id: 1, day: 1, name: "Cloud Gate", fun_fact: "Locals call it 'The Bean.' It has no visible seams." },
  { id: 2, day: 2, name: "Willis Tower", fun_fact: "The glass Skydeck ledges extend 4.3 feet out over the street." },
  { id: 3, day: 3, name: "Navy Pier", fun_fact: "Its Centennial Wheel stands almost 200 feet tall." },
  { id: 4, day: 4, name: "Art Institute", fun_fact: "Its lion statues wear giant sports helmets during finals." },
  { id: 5, day: 5, name: "Wrigley Field", fun_fact: "The ivy on the outfield walls was planted in 1937." },
  { id: 6, day: 6, name: "Riverwalk", fun_fact: "The Chicago River is dyed green every St. Patrick's Day." },
  { id: 7, day: 7, name: "Buckingham Fountain", fun_fact: "One of the largest fountains in the world." },
];

const DETROIT_LANDMARKS = [
  { id: 21, day: 1, name: "Michigan Central Station", fun_fact: "Abandoned for nearly thirty years, it reopened in 2024 after a landmark restoration led by Ford." },
  { id: 22, day: 2, name: "Detroit Institute of Arts", fun_fact: "Diego Rivera's Detroit Industry Murals wrap an entire courtyard with scenes of the auto assembly line." },
  { id: 23, day: 3, name: "Guardian Building", fun_fact: "Its Art Deco lobby, tiled in Pewabic pottery, earned it the nickname 'Cathedral of Finance.'" },
  { id: 24, day: 4, name: "Motown Museum", fun_fact: "The Motown sound was recorded in the converted house that Berry Gordy called Hitsville U.S.A." },
  { id: 25, day: 5, name: "Renaissance Center", fun_fact: "The riverfront towers of GM's headquarters are the tallest in Michigan and define Detroit's skyline." },
];

function genericLandmarks(city: { id: number; name: string }) {
  return Array.from({ length: 5 }, (_, index) => ({
    id: city.id * 10 + index + 1,
    day: index + 1,
    name: `${city.name} field point ${index + 1}`,
    fun_fact: `Demo intel point ${index + 1} for ${city.name}.`,
  }));
}

function landmarksForCity(city: { id: number; name: string }) {
  if (city.id === CHICAGO.id) return CHICAGO_LANDMARKS;
  if (city.id === DETROIT.id) return DETROIT_LANDMARKS;
  return genericLandmarks(city);
}

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
  { id: 2, kind: "achievement", message: "Field Ops confirmed a Detroit lead.", read: false, created_at: "2026-06-12T18:00:00Z" },
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
    const steps = MEMBER_WEEK_STEPS[i];
    return { ...m, steps, target: 70000, pct: Math.min(100, Math.round((steps / 70000) * 100)) };
  });
}

const DEMO_OUTCOME: WeeklyOutcome | null = null;

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
        standardEvidence: evidenceSlot(week.evidence.standardEvidenceId, "standard", false),
        interceptClue: evidenceSlot(week.evidence.interceptClueId, "intercept", false),
      };
    }),
  };
}

function activeWeekFixture(weekConfig: SeasonWeekConfig) {
  const startsOn = weekStartsOn(weekConfig.weekNumber);
  return {
    id: `demo-week-${String(weekConfig.weekNumber).padStart(2, "0")}`,
    starts_on: startsOn,
    ends_on: addDays(startsOn, 6),
    group_target_steps: 210000,
    status: "active" as const,
  };
}

function demoChase(weekConfig: SeasonWeekConfig, week: ReturnType<typeof activeWeekFixture>) {
  const platformSweep = calculateParticipationThreshold(weekConfig.specialOperation, {
    contributors: 2,
    eligiblePlayers: MEMBERS.length,
    active: true,
  });
  const chase = calculateChase({
    activePlayers: MEMBERS.map((member, index) => ({
      userId: member.user_id,
      weeklyTarget: 70000,
      stepsThisWeek: MEMBER_WEEK_STEPS[index],
      lastSyncedAt: new Date(ME.last_synced_at),
      fitbitConnected: true,
    })),
    fieldOps: { activePlayerCount: MEMBERS.length, totalQualifyingLines: 6 },
    specialOperation: {
      maxBonus: platformSweep.maxBonus,
      earnedBonus: platformSweep.earnedBonus,
      contributors: platformSweep.contributors,
      eligiblePlayers: platformSweep.eligiblePlayers,
    },
    nemesis: { activePlayerCount: MEMBERS.length, participantsWithActivity: MEMBERS.length, allMatchupsResolved: false },
    prediction: { activePlayerCount: MEMBERS.length, submittedCount: 1 },
    trackerSync: MEMBERS.map((member) => ({ userId: member.user_id, freshness: "current" as const })),
    elapsedFractionOfWeek: 1,
    now: new Date("2026-06-12T18:50:00.000Z"),
    groupWeeklyTargetSnapshot: week.group_target_steps,
    dataConfidence: "verified",
    final: false,
  });
  return { chase, platformSweep };
}

function demoNemesisFixture(week: ReturnType<typeof activeWeekFixture>, state: string | null) {
  if (state === "bye") {
    return {
      matchup: null,
      you: null,
      nemesis: null,
      week: { starts_on: week.starts_on, ends_on: week.ends_on },
      today: addDays(week.starts_on, 4),
      weekMax: 0,
      outcome: null,
      state: "bye",
    };
  }

  const tiebreak = state === "tiebreak";
  return {
    matchup: {
      id: "demo-matchup",
      week_id: week.id,
      player_a: "demo-me",
      player_b: "demo-maya",
      status: tiebreak ? "tiebreak" : "active",
      score_a: tiebreak ? 2 : 2,
      score_b: tiebreak ? 2 : 1,
      tiebreaker_date: tiebreak ? addDays(week.starts_on, 5) : null,
      rerolled: false,
      winner_id: null,
      daily_results: [
        { date: week.starts_on, a_steps: 9500, b_steps: 8100, winner: "a" },
        { date: addDays(week.starts_on, 1), a_steps: 12000, b_steps: 13000, winner: "b" },
        { date: addDays(week.starts_on, 2), a_steps: 7800, b_steps: 7800, winner: "tie" },
        { date: addDays(week.starts_on, 3), a_steps: 11300, b_steps: 9700, winner: "a" },
        ...(tiebreak ? [{ date: addDays(week.starts_on, 4), a_steps: 8600, b_steps: 9100, winner: "b" as const }] : []),
      ],
    },
    you: { ...MEMBERS[0], steps_today: 7200, steps_this_week: 47800 },
    nemesis: { ...MEMBERS[1], steps_today: 6800, steps_this_week: 45400 },
    week: { starts_on: week.starts_on, ends_on: week.ends_on },
    today: tiebreak ? addDays(week.starts_on, 5) : addDays(week.starts_on, 4),
    weekMax: 13000,
    outcome: tiebreak ? "tiebreak" : null,
    state: tiebreak ? "tiebreak" : "active",
  };
}

export function buildDemoFixtures(weekNumber = DEMO_WEEK_NUMBER): Record<string, unknown> {
  const weekConfig = demoWeekConfig(weekNumber);
  const week = activeWeekFixture(weekConfig);
  const activeCity = cityFixture(weekConfig);
  const nextWeek = getSeasonWeek(weekConfig.weekNumber + 1) ?? null;
  const nextCity = nextWeek ? cityFixture(nextWeek) : null;
  const routeLimit = Math.min(SEASON_ONE_CONFIG.route.length, Math.max(4, weekConfig.weekNumber + 3));
  const route = ROUTE_CITIES.slice(0, routeLimit);
  const currentLandmarks = landmarksForCity(activeCity);
  const landmarkStates = currentLandmarks.map((_landmark, index) =>
    index < 3 ? "unlocked" : index === 3 ? "today" : "locked",
  );
  const reconCity = nextCity ?? activeCity;
  const reconLandmarks = landmarksForCity(reconCity).slice(0, 5);
  const { chase, platformSweep } = demoChase(weekConfig, week);
  const primaryAction = selectPrimaryAction({
    dataConfidence: "verified",
    incompletePlayerCount: 0,
    briefingAvailable: false,
    caseResultAvailable: false,
    phase: "final_push",
    suddenDeathActive: false,
    specialOperationActive: platformSweep.active && platformSweep.earnedBonus < platformSweep.maxBonus,
    predictionActionAvailable: false,
    fieldOpsNearReward: false,
    nemesisClose: false,
    dailyTargetWithinReach: false,
  });
  const primaryBeat = selectPrimaryBeat({
    weekConfig,
    phase: "final_push",
    dataConfidence: "verified",
    projectedOutcome: chase.projectedOutcome,
    finalOutcome: null,
    remainingLead: chase.remainingLead,
    firstLineComplete: true,
    platformSweepActive: platformSweep.active,
    platformSweepEarnedBonus: platformSweep.earnedBonus,
    platformSweepMaxBonus: platformSweep.maxBonus,
  });

  return {
    "/api/auth/session": {
      user: ME,
      group: { id: "demo-group", name: "The Night Walkers", invite_code: "SELENA", admin_id: "demo-me" },
      activeWeek: week,
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
      week,
      city: activeCity,
      nextCity,
      selenaLeadSteps: chase.remainingLead,
      route: route.map((city) => ({ city_id: city.id, name: city.name, visited: city.route_order < weekConfig.weekNumber })),
      progressStrip: progressStrip(),
      leaderboard: leaderboard(),
      countdown: `${addDays(week.ends_on, 1)}T05:00:00Z`,
      lastSyncedAt: "2026-06-12T18:50:00Z",
      seasonState: {
        season: {
          id: SEASON_ONE_CONFIG.id,
          title: SEASON_ONE_CONFIG.title,
          weekNumber: weekConfig.weekNumber,
          totalWeeks: SEASON_ONE_CONFIG.route.length,
        },
        chapter: {
          city: weekConfig.cityName,
          title: weekConfig.chapterTitle,
          complication: weekConfig.complication.label,
          nextCity: weekConfig.nextCityTeaser.cityName || null,
        },
        phase: "final_push",
        dataConfidence: "verified",
        chase: {
          verifiedGroupSteps: chase.verifiedGroupSteps,
          snapshottedTarget: chase.groupWeeklyTarget,
          baseProgress: chase.baseProgress,
          fieldOpsBonus: chase.bonuses.fieldOps,
          specialOperationBonus: chase.bonuses.specialOperation,
          nemesisParticipationBonus: chase.bonuses.nemesisParticipation,
          predictionParticipationBonus: chase.bonuses.predictionParticipation,
          totalNonStepBonus: chase.bonuses.total,
          finalProgress: chase.finalProgress,
          remainingLead: chase.remainingLead,
          projectedOutcome: chase.projectedOutcome,
          finalOutcome: null,
        },
        primaryAction,
        primaryBeat,
        platformSweep,
        evidencePreview: {
          standardEvidenceId: weekConfig.evidence.standardEvidenceId,
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
      city: activeCity,
      landmarks: currentLandmarks.map((landmark, index) => ({ ...landmark, image: null, state: landmarkStates[index] })),
      groupWorkout: {
        total_members: 3,
        worked_out_today: 2,
        members: MEMBERS.map((m, i) => ({ ...m, worked_out: i !== 0 })),
      },
    },
    "/api/predictions/current": {
      week,
      city: { name: activeCity.name },
      myPrediction: {
        user_id: "demo-me", predicted_steps: 205000, submitted_at: `${week.starts_on}T14:00:00Z`,
        actual_delta: null, is_winner: false, display_name: "You", avatar_skin: 5, avatar_hair: 5, avatar_colorway: 1,
      },
      others: "hidden",
      allSubmitted: false,
      liveGroupTotal: DEMO_GROUP_STEPS,
      revealAt: `${addDays(week.ends_on, 1)}T04:59:00Z`,
      state: "partial",
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
        reconCity: { id: reconCity.id, name: reconCity.name, country: "USA" },
        teamTokens: 6,
        unlockedCount: 3,
        overflowBonus: 1,
        unlockedToday: true,
      },
      reconCity: { id: reconCity.id, name: reconCity.name, country: "USA" },
      intel: reconLandmarks.map((landmark, index) => ({
        ...landmark,
        fun_fact: index < 3 ? landmark.fun_fact : null,
        image: null,
        unlocked: index < 3,
        unlock_date: index < 3 ? addDays(week.starts_on, index + 2) : null,
        scouted_by_id: index === 0 ? "demo-jess" : index === 1 ? "demo-me" : index === 2 ? "demo-maya" : null,
        scouted_by: index === 0 ? "Jess" : index === 1 ? "You" : index === 2 ? "Maya" : null,
      })),
      assists: { remaining: 1 },
      teammates: [
        { ...MEMBERS[1], bingo_lines: 1, blackout: false },
        { ...MEMBERS[2], bingo_lines: 3, blackout: false },
      ],
    },
    "/api/fieldops/dossier": {
      owner: { id: "demo-me", display_name: "You" },
      cards: [
        { id: "ic-3", variant: "scouted", created_at: "2026-06-12T14:00:00Z", landmark_id: 23, landmark_name: "Guardian Building", fun_fact: "Its Art Deco lobby, tiled in Pewabic pottery, earned it the nickname 'Cathedral of Finance.'", image: null, city_id: 2, city_name: "Detroit", city_country: "USA" },
        { id: "ic-2", variant: "scouted", created_at: "2026-06-11T09:00:00Z", landmark_id: 22, landmark_name: "Detroit Institute of Arts", fun_fact: "Diego Rivera's Detroit Industry Murals wrap an entire courtyard with scenes of the auto assembly line.", image: null, city_id: 2, city_name: "Detroit", city_country: "USA" },
        { id: "ic-1", variant: "confirmed", created_at: "2026-05-28T20:00:00Z", landmark_id: 2, landmark_name: "Willis Tower Skydeck", fun_fact: "The Ledge's glass boxes extend 4.3 feet out on the 103rd floor.", image: null, city_id: 1, city_name: "Chicago", city_country: "USA" },
      ],
      cities: [
        ...CHICAGO_LANDMARKS.slice(0, 5).map((l) => ({ id: CHICAGO.id, name: CHICAGO.name, country: CHICAGO.country, landmark_id: l.id, day: l.day, landmark_name: l.name, fun_fact: l.fun_fact, image: null })),
        ...DETROIT_LANDMARKS.map((l) => ({ id: DETROIT.id, name: DETROIT.name, country: DETROIT.country, landmark_id: l.id, day: l.day, landmark_name: l.name, fun_fact: l.day <= 3 ? l.fun_fact : null, image: null })),
      ],
    },
    "/api/bingo/friends": {
      friends: [
        { ...MEMBERS[1], bingo_lines: 1, blackout: false },
        { ...MEMBERS[2], bingo_lines: 3, blackout: false },
      ],
    },
    "/api/nemesis/current": demoNemesisFixture(week, null),
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
}

function cityTrophyFixture(cityId: number) {
  const city = ROUTE_CITIES.find((routeCity) => routeCity.id === cityId) ?? CHICAGO;
  const landmarks = landmarksForCity(city);
  return {
    city,
    week: { starts_on: "2026-06-01", ends_on: "2026-06-07", group_target_steps: 210000, group_total_steps: 234500, target_hit: true },
    landmarks: landmarks.map((landmark, index) => ({ ...landmark, image: null, earned: index < 5 })),
    unlocked_count: Math.min(5, landmarks.length),
    champion: { user_id: "demo-me", display_name: "You", avatar_skin: 5, avatar_hair: 5, avatar_colorway: 1, quality: "silver" },
  };
}

/** Resolve a fixture for a GET path, or null if none (caller falls through). */
export function demoResponse<T>(path: string): T | null {
  return demoResponseForWeek(path, DEMO_WEEK_NUMBER);
}

export function demoResponseForWeek<T>(path: string, weekNumber: number): T | null {
  const [clean, queryString = ""] = path.split("?");
  if (clean === "/api/nemesis/current") {
    const week = activeWeekFixture(demoWeekConfig(weekNumber));
    const state = new URLSearchParams(queryString).get("state");
    return demoNemesisFixture(week, state) as T;
  }
  if (clean.startsWith("/api/cities/")) {
    const cityId = Number(clean.split("/").at(-1));
    if (Number.isInteger(cityId)) return cityTrophyFixture(cityId) as T;
  }
  const fixtures = buildDemoFixtures(weekNumber);
  if (clean in fixtures) return fixtures[clean] as T;
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
