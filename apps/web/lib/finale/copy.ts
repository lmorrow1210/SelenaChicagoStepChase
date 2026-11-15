/**
 * Season One send-off copy. Selena's voice: dry, economical, no exclamation
 * points, no performance claims (so it is safe on any data-confidence state).
 * Owner-approved exception to the season-scope rule — a playful send-off only.
 * See docs/canon/season-scope.md (2026-10-17 note).
 */
export const FINALE_KICKER = "CASE 13 · SAN FRANCISCO";
export const FINALE_TITLE = "The Send-Off";

export const FINALE_LINES: readonly string[] = [
  "Thirteen cities, and you never once lost the thread. I loved the chase.",
  "That is the whole confession. Do not repeat it.",
  "The next cable car leaves now. After that, Chicago. I would not unpack.",
];

export const FINALE_SIGNOFF = "— S.C.";

export const FINALE_END = {
  label: "WEEK 01 · CHICAGO",
  heading: "The chase begins again",
  body: "She is already on the move. Your history, badges, dossier, and streaks come with you.",
  cta: "Continue to the Map",
  replay: "Replay",
  skip: "Skip",
  next: "Next",
} as const;

/** Plain-language description for screen readers (the canvas is decorative). */
export const FINALE_SCENE_DESCRIPTION =
  "A pixel-art scene on the San Francisco waterfront. Your detective runs in front of a foggy bridge and stops beside a parked cable car, where Selena Chicago stands in her blue fedora. She turns to speak, tips her hat, and rides the cable car away into the fog.";

/** Reduced-motion key frames, in order. */
export const FINALE_REDUCED_FRAMES = [
  "Frame 1 of 2. You catch up to Selena beside the cable car.",
  "Frame 2 of 2. Selena rides the cable car away. You tip your hat.",
] as const;
