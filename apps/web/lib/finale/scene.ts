/**
 * Scene layout + canvas drawing for the Season One send-off.
 *
 * The scene lives on a tiny logical canvas (W x H "pixels"). The React
 * component scales it by an integer factor so every logical pixel is an exact
 * block of device pixels. Layout is a pure function of (stage, time) so it can
 * be unit-tested and so reduced-motion users can be handed fixed key frames.
 */
import {
  CABLE_CAR,
  PLAYER_FRAMES,
  PUFF,
  SELENA_FRAMES,
  type Sprite,
  type SpritePalette,
} from "./sprites";

export const W = 112;
export const H = 80;

export type Stage = "run" | "talk" | "escape" | "end";

export const RUN_MS = 4400;
export const ESCAPE_MS = 3200;

export const GROUND_Y = 70; // feet line
export const PLAYER_STOP_X = 30;
export const SELENA_X = 56;
export const CAR_X = 60;
const CAR_Y = GROUND_Y - 14;
const FIGURE_H = 18;
const ROOF_Y = CAR_Y + 2; // top of the cable car roof

export interface SceneLayout {
  playerX: number;
  playerY: number;
  playerFrame: keyof typeof PLAYER_FRAMES;
  playerHatLift: boolean;
  selenaX: number;
  selenaY: number;
  selenaFrame: keyof typeof SELENA_FRAMES;
  selenaHatLift: boolean;
  selenaVisible: boolean;
  carX: number;
  /** 0 = none, 1..3 = smoke stage, anchored at the car's grip. */
  puff: 0 | 1 | 2 | 3;
  /** 0..1 black overlay used for the CRT fade-in. */
  fade: number;
}

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export function layout(stage: Stage, ms: number): SceneLayout {
  const base: SceneLayout = {
    playerX: PLAYER_STOP_X,
    playerY: GROUND_Y - FIGURE_H,
    playerFrame: "stand",
    playerHatLift: false,
    selenaX: SELENA_X,
    selenaY: GROUND_Y - FIGURE_H,
    selenaFrame: "stand",
    selenaHatLift: false,
    selenaVisible: true,
    carX: CAR_X,
    puff: 0,
    fade: 0,
  };

  if (stage === "run") {
    const p = clamp01(ms / RUN_MS);
    // Constant stride, then a short ease into the stop.
    const travel = p < 0.8 ? (p / 0.8) * 0.82 : 0.82 + easeOut((p - 0.8) / 0.2) * 0.18;
    const running = p < 0.97;
    return {
      ...base,
      playerX: Math.round(-14 + (PLAYER_STOP_X + 14) * travel),
      playerFrame: running ? (Math.floor(ms / 130) % 2 === 0 ? "runA" : "runB") : "stand",
      selenaFrame: p > 0.9 ? "stand" : "back",
      fade: clamp01(1 - ms / 700),
    };
  }

  if (stage === "talk") {
    return base;
  }

  if (stage === "escape") {
    // 0-500 tip hat, 500-1100 hop to the car, 1100-3000 car rolls away.
    const hop = clamp01((ms - 500) / 600);
    const roll = Math.max(0, ms - 1100);
    const carX = Math.round(CAR_X + 1.36e-5 * roll * roll);
    const aboard = ms >= 1100;
    const jumpX = SELENA_X + (CAR_X + 24 - SELENA_X) * hop;
    const arc = Math.sin(hop * Math.PI) * 9;
    return {
      ...base,
      selenaHatLift: ms < 500,
      selenaFrame: "stand",
      selenaX: Math.round(aboard ? carX + 24 : jumpX),
      selenaY: Math.round(aboard ? ROOF_Y - FIGURE_H : GROUND_Y - FIGURE_H + (ROOF_Y - GROUND_Y) * hop - arc),
      carX,
      playerHatLift: ms > 2000,
      puff: ms >= 1050 && ms < 1500 ? (ms < 1200 ? 1 : ms < 1350 ? 2 : 3) : 0,
    };
  }

  // end: street empty, car gone, player alone.
  return { ...base, selenaVisible: false, carX: W + 10, playerHatLift: true };
}

// ---------------------------------------------------------------- palette

export interface ScenePalette {
  sky: string;
  skyBand: string;
  star: string;
  hills: string;
  bridge: string;
  bridgeHi: string;
  cable: string;
  fog: string;
  water: string;
  glint: string;
  sidewalk: string;
  street: string;
  rail: string;
  lamp: string;
  car: SpritePalette;
  puff: string;
  gull: string;
  fade: string;
  outline: string;
  selena: {
    sky: string;
    band: string;
    coat: string;
    coatDark: string;
    hair: string;
    face: string;
    boots: string;
  };
}

/** Resolve every color from design-system custom properties on `el`. */
export function readScenePalette(el: Element): ScenePalette {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim() || "transparent";
  return {
    sky: v("--screen-base"),
    skyBand: v("--screen-700"),
    star: v("--phosphor-dim"),
    hills: v("--grid-line"),
    bridge: v("--tan-500"),
    bridgeHi: v("--tan-300"),
    cable: v("--case-600"),
    fog: v("--screen-600"),
    water: v("--screen-700"),
    glint: v("--phosphor-dim"),
    sidewalk: v("--case-700"),
    street: v("--case-800"),
    rail: v("--tan-500"),
    lamp: v("--phosphor-hot"),
    car: {
      a: v("--tan-400"),
      o: v("--case-700"),
      w: v("--screen-base"),
      t: v("--phosphor-dim"),
      k: v("--tan-300"),
      x: v("--case-shadow"),
      g: v("--phosphor-hot"),
    },
    puff: v("--tan-100"),
    gull: v("--phosphor-dim"),
    fade: v("--case-shadow"),
    outline: v("--case-shadow"),
    selena: {
      sky: v("--sprite-selena-sky"),
      band: v("--signal-red"),
      coat: v("--phosphor"),
      coatDark: v("--phosphor-dim"),
      hair: v("--case-shadow"),
      face: v("--case-900"),
      boots: v("--case-900"),
    },
  };
}

// ---------------------------------------------------------------- drawing

type Ctx = CanvasRenderingContext2D;

function rect(ctx: Ctx, color: string, x: number, y: number, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function drawSprite(
  ctx: Ctx,
  sprite: Sprite,
  palette: SpritePalette,
  x: number,
  y: number,
  opts: { flip?: boolean; hatLift?: boolean } = {},
) {
  const w = sprite[0]!.length;
  for (let row = 0; row < sprite.length; row++) {
    const dy = opts.hatLift && row < 4 ? -1 : 0;
    const line = sprite[row]!;
    for (let col = 0; col < w; col++) {
      const key = line[col]!;
      if (key === ".") continue;
      const color = palette[key];
      if (!color) continue;
      const dx = opts.flip ? w - 1 - col : col;
      rect(ctx, color, x + dx, y + row + dy);
    }
  }
}

/** Cheap deterministic hash in [0,1). */
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function drawSky(ctx: Ctx, p: ScenePalette, ambient: number) {
  rect(ctx, p.sky, 0, 0, W, H);
  // Horizon haze as a dithered gradient.
  for (let y = 22; y < 50; y++) {
    const density = (y - 22) / 28;
    for (let x = 0; x < W; x++) {
      if (hash(x * 0.37 + y * 1.91) < density * 0.9 && (x + y) % 2 === 0) rect(ctx, p.skyBand, x, y);
    }
  }
  for (let i = 0; i < 16; i++) {
    const sx = Math.floor(hash(i + 1) * W);
    const sy = Math.floor(hash(i + 40) * 22);
    const on = Math.floor(ambient / 700 + i * 3) % 5 !== 0;
    if (on) rect(ctx, p.star, sx, sy);
  }
}

function drawHills(ctx: Ctx, p: ScenePalette) {
  for (let x = 0; x < W; x++) {
    const top = Math.round(41 + 3 * Math.sin(x * 0.06) + 2 * Math.sin(x * 0.17 + 1) - (x > 90 ? (x - 90) * 0.25 : 0));
    rect(ctx, p.hills, x, top, 1, 50 - top);
  }
}

function drawBridge(ctx: Ctx, p: ScenePalette) {
  const T1 = 24;
  const T2 = 84;
  const top = 15;
  const deck = 47;
  // Towers: two legs + cross-braces.
  for (const tx of [T1, T2]) {
    rect(ctx, p.bridge, tx - 2, top, 2, deck - top + 8);
    rect(ctx, p.bridge, tx + 1, top, 2, deck - top + 8);
    rect(ctx, p.bridgeHi, tx - 2, top, 1, deck - top);
    rect(ctx, p.bridgeHi, tx + 1, top, 1, deck - top);
    for (const by of [top + 8, top + 18, top + 28]) rect(ctx, p.bridge, tx, by, 1, 2);
    for (const by of [top + 8, top + 18, top + 28]) rect(ctx, p.bridge, tx - 2, by, 5, 1);
    rect(ctx, p.bridge, tx - 3, top - 1, 7, 1);
  }
  // Deck + truss underside.
  rect(ctx, p.bridge, 0, deck, W, 2);
  for (let x = 0; x < W; x += 2) rect(ctx, p.cable, x, deck + 2);
  // Main cable + suspenders.
  const cableY = (x: number): number => {
    if (x < T1) {
      const t = (T1 - x) / T1;
      return top + 1 + (deck - 3 - top) * t * t;
    }
    if (x > T2) {
      const t = (x - T2) / (W - T2);
      return top + 1 + (deck - 3 - top) * t * t;
    }
    const u = (x - (T1 + T2) / 2) / ((T2 - T1) / 2);
    return top + 1 + 22 * (1 - u * u);
  };
  for (let x = 0; x < W; x++) {
    const y = Math.round(cableY(x));
    rect(ctx, p.bridgeHi, x, y);
    if (x % 4 === 0 && y < deck) rect(ctx, p.cable, x, y + 1, 1, deck - y - 1);
  }
}

function drawFog(ctx: Ctx, p: ScenePalette, ambient: number) {
  const bands = [
    { y: 34, h: 6, speed: 0.006, thresh: 0.18 },
    { y: 40, h: 8, speed: 0.011, thresh: 0.05 },
    { y: 46, h: 6, speed: 0.016, thresh: -0.05 },
  ];
  for (const b of bands) {
    const off = ambient * b.speed;
    for (let y = b.y; y < b.y + b.h; y++) {
      for (let x = 0; x < W; x++) {
        const n = Math.sin((x + off) * 0.11 + y * 0.9) + Math.sin((x - off * 0.6) * 0.27 + y * 0.4);
        if (n * 0.5 > b.thresh && (x + y) % 2 === 0) rect(ctx, p.fog, x, y);
      }
    }
  }
}

function drawWater(ctx: Ctx, p: ScenePalette, ambient: number) {
  rect(ctx, p.water, 0, 50, W, 12);
  for (let i = 0; i < 26; i++) {
    const gx = Math.floor(hash(i + 90) * W);
    const gy = 52 + Math.floor(hash(i + 7) * 9);
    if ((Math.floor(ambient / 500) + i) % 3 === 0) rect(ctx, p.glint, gx, gy, 2, 1);
  }
}

function drawStreet(ctx: Ctx, p: ScenePalette) {
  rect(ctx, p.sidewalk, 0, 62, W, 4);
  rect(ctx, p.rail, 0, 62, W, 1);
  rect(ctx, p.street, 0, 66, W, H - 66);
  // Cable-car slot + rails.
  rect(ctx, p.rail, 0, 71, W, 1);
  rect(ctx, p.rail, 0, 74, W, 1);
  for (let x = 0; x < W; x += 6) rect(ctx, p.sky, x, 72, 3, 1);
  // Street lamps.
  for (const lx of [8, 104]) {
    rect(ctx, p.rail, lx, 50, 1, 13);
    rect(ctx, p.rail, lx - 1, 50, 3, 1);
    rect(ctx, p.lamp, lx, 49);
  }
}

function drawGulls(ctx: Ctx, p: ScenePalette, ambient: number) {
  for (let i = 0; i < 2; i++) {
    const x = Math.floor((ambient * (0.012 + i * 0.004) + i * 60) % (W + 20)) - 10;
    const y = 12 + i * 9 + Math.round(Math.sin(ambient / 600 + i) * 2);
    const flap = Math.floor(ambient / 250 + i) % 2 === 0;
    rect(ctx, p.gull, x, y + (flap ? 0 : 1));
    rect(ctx, p.gull, x + 1, y + 1);
    rect(ctx, p.gull, x + 2, y + (flap ? 0 : 1));
  }
}

export function drawScene(ctx: Ctx, p: ScenePalette, lay: SceneLayout, player: SpritePalette, ambient: number) {
  ctx.imageSmoothingEnabled = false;
  drawSky(ctx, p, ambient);
  drawHills(ctx, p);
  drawBridge(ctx, p);
  drawFog(ctx, p, ambient);
  drawWater(ctx, p, ambient);
  drawGulls(ctx, p, ambient);
  drawStreet(ctx, p);

  if (lay.carX < W) drawSprite(ctx, CABLE_CAR, p.car, lay.carX, CAR_Y);

  const selenaPal: SpritePalette = {
    h: p.selena.sky,
    b: p.selena.band,
    s: p.selena.face,
    r: p.selena.hair,
    c: p.selena.coat,
    d: p.selena.coatDark,
    f: p.selena.boots,
    e: p.selena.hair,
  };
  if (lay.selenaVisible) {
    // Selena faces left (toward you) once she has noticed you.
    drawSprite(ctx, SELENA_FRAMES[lay.selenaFrame], selenaPal, lay.selenaX, lay.selenaY, {
      flip: lay.selenaFrame !== "back",
      hatLift: lay.selenaHatLift,
    });
  }
  drawSprite(ctx, PLAYER_FRAMES[lay.playerFrame], player, lay.playerX, lay.playerY, {
    hatLift: lay.playerHatLift,
  });

  if (lay.puff > 0) {
    const puff = PUFF[lay.puff - 1]!;
    const puffPal: SpritePalette = { p: p.puff };
    drawSprite(ctx, puff, puffPal, lay.carX + 22 - Math.floor(puff[0]!.length / 2), CAR_Y - 6);
  }

  if (lay.fade > 0) {
    ctx.globalAlpha = lay.fade;
    rect(ctx, p.fade, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}
