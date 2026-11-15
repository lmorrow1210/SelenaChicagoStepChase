"use client";

import { useEffect, useRef } from "react";
import { COLORWAYS } from "@one-step-ahead/design-system/components/game/Avatar";
import { drawSprite } from "@/lib/finale/scene";
import { PLAYER_FRAMES, colorwayFromIndex, playerPalette, spriteSize } from "@/lib/finale/sprites";
import { allAvatarChoices } from "@/lib/finale/trigger";

// Same gate as the week simulator: dev, the QA demo, or the static demo build.
const enabled =
  process.env.NODE_ENV === "development"
  || process.env.NEXT_PUBLIC_ENABLE_WEEK_SIMULATOR === "1"
  || process.env.NEXT_PUBLIC_DEMO === "1";

const SCALE = 3;
const { w: SW, h: SH } = spriteSize(PLAYER_FRAMES.stand);

function Sprite({ skin, hair, colorway }: { skin: number; hair: number; colorway: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const outline = getComputedStyle(canvas).getPropertyValue("--case-shadow").trim();
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, SW, SH);
    drawSprite(ctx, PLAYER_FRAMES.stand, playerPalette({ skin, hair, colorway }, outline), 0, 0);
  }, [skin, hair, colorway]);
  const coat = COLORWAYS[colorwayFromIndex(colorway)].label;
  return (
    <canvas
      ref={ref}
      width={SW * SCALE}
      height={SH * SCALE}
      role="img"
      aria-label={`Skin ${skin}, hair ${hair}, ${coat} coat`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function SpriteSheetPage() {
  if (!enabled) return <main style={{ padding: "var(--space-md)" }}><p>Sprite sheet is disabled in this build.</p></main>;
  const choices = allAvatarChoices();
  return (
    <main className="sheet">
      <header>
        <p className="kicker">DEV SPRITE SHEET</p>
        <h1>Every avatar, in pixels</h1>
        <p>
          {choices.length} combinations: 5 skin tones x 5 hair colors x 6 coats — the exact options the
          avatar picker offers. Rows are coats; each block is one skin tone, hair color across.
        </p>
      </header>
      {Array.from({ length: 6 }, (_, c) => c + 1).map((colorway) => (
        <section key={colorway} aria-label={`${COLORWAYS[colorwayFromIndex(colorway)].label} coat`}>
          <h2>{COLORWAYS[colorwayFromIndex(colorway)].label}</h2>
          <div className="grid">
            {choices.filter((choice) => choice.colorway === colorway).map((choice) => (
              <Sprite key={`${choice.skin}-${choice.hair}`} {...choice} />
            ))}
          </div>
        </section>
      ))}
      <style jsx>{`
        .sheet {
          padding: var(--space-md);
          max-width: 760px;
          margin: 0 auto;
          color: var(--phosphor);
          min-height: 100dvh;
          background: var(--screen-base);
        }
        .kicker {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          color: var(--phosphor-dim);
        }
        h1 {
          margin: var(--sp-1) 0;
          font-family: var(--font-display);
          font-size: var(--fs-h1);
          text-transform: uppercase;
          color: var(--phosphor);
        }
        h2 {
          margin: var(--sp-3) 0 var(--sp-2);
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
          gap: var(--sp-2);
          background: var(--screen-700);
          padding: var(--sp-2);
          border: 1px solid var(--hairline);
        }
      `}</style>
    </main>
  );
}
