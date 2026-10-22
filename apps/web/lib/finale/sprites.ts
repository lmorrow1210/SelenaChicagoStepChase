/**
 * Original pixel art for the Season One send-off. Sprites are ASCII grids so
 * they stay reviewable in a diff; each character maps to a palette slot.
 * Nothing here knows about hex values — palettes are resolved at runtime
 * (design-system tokens + the Avatar option tables).
 */
import {
  COLORWAYS,
  HAIR_COLORS,
  SKIN_TONES,
  type ColorwayId,
} from "@one-step-ahead/design-system/components/game/Avatar";

export type Sprite = readonly string[];
export type SpritePalette = Record<string, string | null>;

/** Player figure, facing right. 12 x 18. */
const FIGURE_HEAD: Sprite = [
  "....hhhh....",
  "...hhhhhh...",
  "...bbbbbb...",
  "..hhhhhhhh..",
  "..rsssssr...",
  "..rssssesr..",
  "..rrsssssr..",
  "...rcddcr...",
  "..ccccdccc..",
  "..ccccdccc..",
  "..cddddddc..",
  "..ccccdccc..",
  "..ccccdccc..",
];

/** Same head with the face turned away (Selena before she notices you). */
const FIGURE_HEAD_BACK: Sprite = [
  "....hhhh....",
  "...hhhhhh...",
  "...bbbbbb...",
  "..hhhhhhhh..",
  "..rrrrrrr...",
  "..rrrrrrrr..",
  "..rrrrrrrr..",
  "...rcddcr...",
  "..ccccdccc..",
  "..ccccdccc..",
  "..cddddddc..",
  "..ccccdccc..",
  "..ccccdccc..",
];

const LEGS = {
  stand: ["...ccddcc...", "...ff..ff...", "...ff..ff...", "..fff..fff.."],
  runA: ["...ccddcc...", "..ff....ff..", ".ff......ff.", ".fff....fff."],
  runB: ["...ccddcc...", "....f..f....", "....ffff....", "....ffff...."],
} as const;

function figure(head: Sprite, legs: readonly string[]): Sprite {
  return [...head, ...legs];
}

export const PLAYER_FRAMES = {
  stand: figure(FIGURE_HEAD, LEGS.stand),
  runA: figure(FIGURE_HEAD, LEGS.runA),
  runB: figure(FIGURE_HEAD, LEGS.runB),
} as const;

export const SELENA_FRAMES = {
  back: figure(FIGURE_HEAD_BACK, LEGS.stand),
  stand: figure(FIGURE_HEAD, LEGS.stand),
  runA: figure(FIGURE_HEAD, LEGS.runA),
  runB: figure(FIGURE_HEAD, LEGS.runB),
} as const;

/** Hat-tip: the hat lifts one pixel row. Applied by the scene, not a frame. */

/**
 * Cable car, facing right. 40 x 20.
 *  a body  o roof  w window  t trim  k grip pole  x wheel  g glow lamp
 */
export const CABLE_CAR: Sprite = [
  "......kk..........................kk....",
  "......kk..........................kk....",
  "..oooooooooooooooooooooooooooooooooooo..",
  "..oooooooooooooooooooooooooooooooooooo..",
  "..aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..",
  "..awwwwaawwwwaawwwwaawwwwaawwwwaawwwwa..",
  "..awwwwaawwwwaawwwwaawwwwaawwwwaawwwwa..",
  "..awwwwaawwwwaawwwwaawwwwaawwwwaawwwwa..",
  "..aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..",
  "..tttttttttttttttttttttttttttttttttttt..",
  "..aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag.",
  "..aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.",
  "..oooooooooooooooooooooooooooooooooooo..",
  "....xxxx..................xxxx..........",
  "....xxxx..................xxxx..........",
];

/** Puff of smoke for the hat-tip vanish option; 3 growth stages. */
export const PUFF: readonly Sprite[] = [
  ["..pp..", ".pppp.", "..pp.."],
  ["..pppp..", ".pppppp.", "pppppppp", ".pppppp.", "..pppp.."],
  ["pp.pppp.pp", ".pppppppp.", "pppppppppp", ".pppppppp.", "pp.pppp.pp"],
];

/** Fog-banks and gulls are drawn procedurally in scene.ts. */

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 255) + amt);
  const b = clamp((n & 255) + amt);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function channelMax(hex: string): number {
  return Math.max(
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  );
}

export const COLORWAY_IDS: ColorwayId[] = ["chicago", "midnight", "emerald", "crimson", "desert", "violet"];

export interface AvatarChoice {
  /** 1-based, exactly as stored on the user (avatar_skin / avatar_hair / avatar_colorway). */
  skin: number;
  hair: number;
  colorway: number;
}

const pick = <T,>(list: readonly T[], oneBased: number): T =>
  list[((Math.max(1, Math.trunc(oneBased)) - 1) % list.length)]!;

export function colorwayFromIndex(oneBased: number): ColorwayId {
  return pick(COLORWAY_IDS, oneBased);
}

/**
 * Palette for the player's pixel sprite — the same skin / hair / colorway
 * tables the SVG Avatar uses, with the same hat rule (boots color, or a
 * lightened coat when the boots are near-black).
 */
export function playerPalette(choice: AvatarChoice, outline: string): SpritePalette {
  const cw = COLORWAYS[colorwayFromIndex(choice.colorway)];
  const bootsDark = channelMax(cw.boots) < 55;
  const hat = bootsDark ? shade(cw.coat, 28) : shade(cw.boots, -8);
  const band = bootsDark ? shade(cw.coat, -20) : shade(cw.boots, -45);
  return {
    h: hat,
    b: band,
    s: pick(SKIN_TONES, choice.skin),
    r: pick(HAIR_COLORS, choice.hair),
    c: cw.coat,
    d: shade(cw.coat, -26),
    f: cw.boots,
    e: outline,
  };
}

/** Selena's costume as the app shows it today: sky fedora, red band, phosphor trench. */
export function selenaPalette(t: {
  sky: string;
  band: string;
  coat: string;
  coatDark: string;
  hair: string;
  face: string;
  boots: string;
}): SpritePalette {
  return { h: t.sky, b: t.band, s: t.face, r: t.hair, c: t.coat, d: t.coatDark, f: t.boots, e: t.hair };
}

/** Every distinct palette slot a sprite uses (for tests). */
export function spriteSlots(sprite: Sprite): Set<string> {
  const slots = new Set<string>();
  for (const row of sprite) for (const ch of row) if (ch !== ".") slots.add(ch);
  return slots;
}

export function spriteSize(sprite: Sprite): { w: number; h: number } {
  return { w: sprite[0]?.length ?? 0, h: sprite.length };
}
