import { describe, expect, it } from "vitest";
import { FINALE_END, FINALE_LINES, FINALE_REDUCED_FRAMES, FINALE_SCENE_DESCRIPTION, FINALE_SIGNOFF } from "./copy";
import {
  ESCAPE_MS,
  PLAYER_STOP_X,
  RUN_MS,
  W,
  layout,
} from "./scene";
import {
  CABLE_CAR,
  PLAYER_FRAMES,
  PUFF,
  SELENA_FRAMES,
  playerPalette,
  spriteSlots,
  spriteSize,
  type Sprite,
} from "./sprites";
import {
  FINALE_WEEK_NUMBER,
  allAvatarChoices,
  avatarChoiceFromUser,
  shouldAutoOpenFinale,
  shouldOpenFinaleNow,
} from "./trigger";

const rectangular = (sprite: Sprite) => sprite.every((row) => row.length === sprite[0]!.length);

describe("finale trigger", () => {
  it("auto-opens only for an unseen Week 13 case", () => {
    expect(shouldAutoOpenFinale(null)).toBe(false);
    expect(shouldAutoOpenFinale({ weekNumber: 12, finaleViewed: false })).toBe(false);
    expect(shouldAutoOpenFinale({ weekNumber: 1, finaleViewed: false })).toBe(false);
    expect(shouldAutoOpenFinale({ weekNumber: FINALE_WEEK_NUMBER, finaleViewed: false })).toBe(true);
    expect(shouldAutoOpenFinale({ weekNumber: FINALE_WEEK_NUMBER })).toBe(true);
    expect(shouldAutoOpenFinale({ weekNumber: FINALE_WEEK_NUMBER, finaleViewed: true })).toBe(false);
  });

  it("waits for the case-closed report, then opens exactly once", () => {
    const unseen = { weekNumber: 13, finaleViewed: false, viewed: false };
    // report not yet dismissed this visit (or not yet auto-opened)
    expect(shouldOpenFinaleNow(unseen, null, null)).toBe(false);
    expect(shouldOpenFinaleNow(unseen, null, true)).toBe(false);
    // dismissed this visit
    expect(shouldOpenFinaleNow(unseen, null, false)).toBe(true);
    // report was already viewed on an earlier visit: go straight to the send-off
    expect(shouldOpenFinaleNow({ ...unseen, viewed: true }, null, null)).toBe(true);
    // once the overlay has been opened (or closed) never auto-open again
    expect(shouldOpenFinaleNow(unseen, true, false)).toBe(false);
    expect(shouldOpenFinaleNow(unseen, false, false)).toBe(false);
    // already seen on the server (another device)
    expect(shouldOpenFinaleNow({ ...unseen, finaleViewed: true }, null, false)).toBe(false);
  });

  it("reads the stored 1-based avatar choice, defaulting safely", () => {
    expect(avatarChoiceFromUser({ avatar_skin: 3, avatar_hair: 4, avatar_colorway: 6 })).toEqual({ skin: 3, hair: 4, colorway: 6 });
    expect(avatarChoiceFromUser(null)).toEqual({ skin: 1, hair: 1, colorway: 1 });
  });
});

describe("pixel sprites", () => {
  const all: Array<[string, Sprite]> = [
    ...Object.entries(PLAYER_FRAMES).map(([k, v]) => [`player.${k}`, v] as [string, Sprite]),
    ...Object.entries(SELENA_FRAMES).map(([k, v]) => [`selena.${k}`, v] as [string, Sprite]),
    ["cableCar", CABLE_CAR],
    ...PUFF.map((p, i) => [`puff.${i}`, p] as [string, Sprite]),
  ];

  it.each(all)("%s is a clean rectangle", (_name, sprite) => {
    expect(rectangular(sprite)).toBe(true);
  });

  it("all figure frames share one size so they can swap in place", () => {
    const sizes = new Set(
      [...Object.values(PLAYER_FRAMES), ...Object.values(SELENA_FRAMES)].map((s) => JSON.stringify(spriteSize(s))),
    );
    expect(sizes.size).toBe(1);
  });

  it("has a sprite palette for every avatar option the picker can produce (150)", () => {
    const choices = allAvatarChoices();
    expect(choices).toHaveLength(5 * 5 * 6);
    const slots = new Set<string>();
    for (const frame of Object.values(PLAYER_FRAMES)) spriteSlots(frame).forEach((k) => slots.add(k));
    const seen = new Set<string>();
    for (const choice of choices) {
      const palette = playerPalette(choice, "outline");
      for (const slot of slots) {
        // `e` (eye/outline) is the caller-supplied token color, not an avatar option.
        if (slot === "e") expect(palette.e).toBe("outline");
        else expect(palette[slot], `slot ${slot} for ${JSON.stringify(choice)}`).toMatch(/^#[0-9a-f]{6}$/i);
      }
      seen.add(JSON.stringify([palette.s, palette.r, palette.c, palette.f]));
    }
    expect(seen.size).toBe(150); // every option renders a distinct figure
  });

  it("wraps out-of-range stored indexes the way the SVG Avatar does", () => {
    expect(playerPalette({ skin: 6, hair: 6, colorway: 7 }, "outline")).toEqual(
      playerPalette({ skin: 1, hair: 1, colorway: 1 }, "outline"),
    );
  });
});

describe("scene timeline", () => {
  it("runs in from off-screen and stops beside Selena", () => {
    expect(layout("run", 0).playerX).toBeLessThan(0);
    expect(layout("run", RUN_MS).playerX).toBe(PLAYER_STOP_X);
    expect(layout("run", RUN_MS).playerFrame).toBe("stand");
    expect(layout("run", 1000).playerFrame).toMatch(/^run/);
    expect(layout("run", 0).fade).toBeGreaterThan(0);
  });

  it("alternates run frames", () => {
    const frames = new Set([0, 130, 260, 390].map((ms) => layout("run", ms).playerFrame));
    expect(frames).toEqual(new Set(["runA", "runB"]));
  });

  it("Selena hops aboard and the cable car leaves the screen", () => {
    expect(layout("escape", 0).selenaHatLift).toBe(true);
    const mid = layout("escape", 1700);
    expect(mid.carX).toBeGreaterThan(layout("escape", 0).carX);
    expect(mid.selenaX).toBeGreaterThanOrEqual(mid.carX);
    expect(layout("escape", ESCAPE_MS).carX).toBeGreaterThanOrEqual(W);
    expect(layout("end", 0).selenaVisible).toBe(false);
  });

  it("total runtime stays inside the 10-20 second brief", () => {
    const talkMs = FINALE_LINES.reduce((sum, line) => sum + line.length * 26 + 1100, 500);
    const total = (RUN_MS + talkMs + ESCAPE_MS) / 1000;
    expect(total).toBeGreaterThan(10);
    expect(total).toBeLessThan(20);
  });
});

describe("finale copy (owner scope exception)", () => {
  const everything = [
    ...FINALE_LINES,
    FINALE_SIGNOFF,
    FINALE_SCENE_DESCRIPTION,
    ...FINALE_REDUCED_FRAMES,
    ...Object.values(FINALE_END),
  ].join(" ");

  it("signs off as S.C. and keeps to 1-3 short lines", () => {
    expect(FINALE_SIGNOFF).toBe("— S.C.");
    expect(FINALE_LINES.length).toBeGreaterThanOrEqual(1);
    expect(FINALE_LINES.length).toBeLessThanOrEqual(3);
    for (const line of FINALE_LINES) expect(line.length).toBeLessThanOrEqual(90);
  });

  it("stays on-voice: no exclamation points", () => {
    for (const line of FINALE_LINES) expect(line).not.toContain("!");
  });

  it("contains no parked lore", () => {
    // Terms are split so this guard itself doesn't trip the repo-wide lore grep.
    const parked = ["merid" + "ian", "bureau consp" + "iracy", "same n" + "ode", "brass d" + "ial", "fourte" + "enth", "season t" + "wo"];
    for (const term of parked) expect(everything.toLowerCase()).not.toContain(term);
    expect(everything).not.toMatch(/\bnode\b|\bcoat\b/i);
  });

  it("hands off to Chicago", () => {
    expect(FINALE_END.label).toMatch(/chicago/i);
    expect(FINALE_END.cta).toMatch(/map/i);
  });
});
