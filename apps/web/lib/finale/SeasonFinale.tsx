"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FINALE_END,
  FINALE_KICKER,
  FINALE_LINES,
  FINALE_REDUCED_FRAMES,
  FINALE_SCENE_DESCRIPTION,
  FINALE_SIGNOFF,
  FINALE_TITLE,
} from "./copy";
import { ESCAPE_MS, H, RUN_MS, W, drawScene, layout, readScenePalette, type ScenePalette, type Stage } from "./scene";
import { playerPalette, type AvatarChoice, type SpritePalette } from "./sprites";
import { useDialogFocus } from "../useDialogFocus";
import { setCinematicOpen } from "./openState";

const CHAR_MS = 26; // typewriter speed
const HOLD_MS = 1100; // pause on a finished line before auto-advancing
const FIRST_LINE_DELAY_MS = 500;
const REDUCED_ESCAPE_FRAME_MS = 1700;

interface Sim {
  stage: Stage;
  stageStart: number;
  line: number;
  lineStart: number;
  lineDone: boolean;
  doneAt: number;
  completed: boolean;
}

export interface SeasonFinaleProps {
  avatar: AvatarChoice;
  /** "overlay" = modal over the map; "page" = the standalone /finale route. */
  variant?: "overlay" | "page";
  /** Fired once per mount when the player reaches (or skips to) the end card. */
  onComplete?: () => void;
  /** Continue button / Escape on the end card. */
  onContinue: () => void;
}

/**
 * The Season One send-off: a ~15 second pixel-art scene on a canvas, with all
 * text in the DOM. Skippable, replayable, reduced-motion aware.
 */
export function SeasonFinale({ avatar, variant = "overlay", onComplete, onContinue }: SeasonFinaleProps) {
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const paletteRef = useRef<ScenePalette | null>(null);
  const playerRef = useRef<SpritePalette | null>(null);
  const scaleRef = useRef(1);
  const redrawRef = useRef<() => void>(() => {});
  const simRef = useRef<Sim>({ stage: "run", stageStart: 0, line: -1, lineStart: 0, lineDone: false, doneAt: 0, completed: false });
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [reduced, setReduced] = useState<boolean | null>(null);
  const [stage, setStage] = useState<Stage>("run");
  const [line, setLine] = useState(-1);
  const [typed, setTyped] = useState(0);
  const [rstep, setRstep] = useState<0 | 1>(0);
  const [runId, setRunId] = useState(0);

  const atEnd = reduced ? rstep === 1 : stage === "end";

  // ---- reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ---- canvas sizing: integer device-pixel scale, DPR aware
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    paletteRef.current = readScenePalette(canvas);
    playerRef.current = playerPalette(avatar, paletteRef.current.outline);

    const measure = () => {
      const dpr = window.devicePixelRatio || 1;
      const scale = Math.max(1, Math.floor((wrap.clientWidth * dpr) / W));
      scaleRef.current = scale;
      canvas.width = W * scale;
      canvas.height = H * scale;
      canvas.style.width = `${(W * scale) / dpr}px`;
      canvas.style.height = `${(H * scale) / dpr}px`;
      redrawRef.current();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [avatar]);

  const paint = useCallback((st: Stage, ms: number, ambient: number) => {
    const canvas = canvasRef.current;
    const pal = paletteRef.current;
    const player = playerRef.current;
    if (!canvas || !pal || !player) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = scaleRef.current;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    drawScene(ctx, pal, layout(st, ms), player, ambient);
  }, []);

  const finish = useCallback(() => {
    const sim = simRef.current;
    if (!sim.completed) {
      sim.completed = true;
      onCompleteRef.current?.();
    }
  }, []);

  // ---- animated timeline
  useEffect(() => {
    if (reduced !== false) return;
    const sim = simRef.current;
    let raf = 0;
    const t0 = performance.now();
    sim.stage = "run";
    sim.stageStart = t0;
    sim.line = -1;
    sim.lineDone = false;
    setStage("run");
    setLine(-1);
    setTyped(0);

    const enter = (next: Stage, now: number) => {
      sim.stage = next;
      sim.stageStart = now;
      setStage(next);
      if (next === "end") finish();
    };
    const startLine = (i: number, now: number) => {
      sim.line = i;
      sim.lineStart = now;
      sim.lineDone = false;
      setLine(i);
      setTyped(0);
    };

    const tick = (now: number) => {
      const elapsed = now - sim.stageStart;
      if (sim.stage === "run" && elapsed >= RUN_MS) enter("talk", now);
      if (sim.stage === "talk") {
        if (sim.line === -1 && now - sim.stageStart >= FIRST_LINE_DELAY_MS) startLine(0, now);
        if (sim.line >= 0) {
          const text = FINALE_LINES[sim.line]!;
          const n = Math.min(text.length, Math.floor((now - sim.lineStart) / CHAR_MS));
          setTyped(n);
          if (n >= text.length && !sim.lineDone) {
            sim.lineDone = true;
            sim.doneAt = now;
          }
          if (sim.lineDone && now - sim.doneAt >= HOLD_MS) {
            if (sim.line < FINALE_LINES.length - 1) startLine(sim.line + 1, now);
            else enter("escape", now);
          }
        }
      }
      if (sim.stage === "escape" && now - sim.stageStart >= ESCAPE_MS) enter("end", now);
      const st = sim.stage;
      paint(st, now - sim.stageStart, now - t0);
      redrawRef.current = () => paint(sim.stage, performance.now() - sim.stageStart, performance.now() - t0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, runId, paint, finish]);

  // ---- reduced motion: static key frames
  useEffect(() => {
    if (reduced !== true) return;
    const draw = () => (rstep === 0 ? paint("talk", 0, 0) : paint("escape", REDUCED_ESCAPE_FRAME_MS, 0));
    redrawRef.current = draw;
    draw();
    if (rstep === 1) finish();
  }, [reduced, rstep, paint, finish]);

  // ---- focus the primary action when the end card appears
  useEffect(() => {
    if (atEnd) continueRef.current?.focus();
  }, [atEnd]);

  useEffect(() => {
    setCinematicOpen(true);
    return () => setCinematicOpen(false);
  }, []);

  // ---- overlay: lock page scroll behind it
  useEffect(() => {
    if (variant !== "overlay") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [variant]);

  const skip = useCallback(() => {
    if (reduced) {
      setRstep(1);
      return;
    }
    const sim = simRef.current;
    if (sim.stage === "end") return;
    sim.stage = "end";
    sim.stageStart = performance.now();
    setStage("end");
    finish();
  }, [reduced, finish]);

  const advance = useCallback(() => {
    if (reduced) {
      setRstep(1);
      return;
    }
    const sim = simRef.current;
    const now = performance.now();
    if (sim.stage === "run") {
      sim.stage = "talk";
      sim.stageStart = now - FIRST_LINE_DELAY_MS;
      setStage("talk");
    } else if (sim.stage === "talk" && sim.line >= 0) {
      if (!sim.lineDone) {
        sim.lineStart = now - FINALE_LINES[sim.line]!.length * CHAR_MS;
      } else {
        sim.doneAt = now - HOLD_MS; // next tick advances
      }
    }
  }, [reduced]);

  const replay = useCallback(() => {
    setRstep(0);
    setRunId((n) => n + 1);
  }, []);

  const onEscape = useCallback(() => {
    if (atEnd) onContinue();
    else skip();
  }, [atEnd, onContinue, skip]);

  useDialogFocus(rootRef, variant === "overlay", onEscape);

  const lastIndex = FINALE_LINES.length - 1;
  const showSpeech = reduced ? rstep === 0 : stage === "talk" || stage === "escape";
  const currentText = line >= 0 ? FINALE_LINES[line]!.slice(0, typed) : "";
  const lineIsDone = line >= 0 && typed >= FINALE_LINES[line]!.length;
  const showSign = line === lastIndex && lineIsDone;
  const announce = reduced
    ? FINALE_REDUCED_FRAMES[rstep]
    : atEnd
      ? `${FINALE_END.heading}. ${FINALE_END.label}.`
      : line >= 0
        ? `${FINALE_LINES[line]}${line === lastIndex ? ` ${FINALE_SIGNOFF}` : ""}`
        : "";

  const Root = variant === "overlay" ? "div" : "main";

  const tree = (
    <Root
      ref={rootRef as never}
      className={`finale ${variant}`}
      {...(variant === "overlay"
        ? { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, tabIndex: -1 }
        : { "aria-labelledby": titleId })}
    >
      <div className="inner">
        <header className="bar">
          <div>
            <p className="kicker">{FINALE_KICKER}</p>
            <h1 id={titleId} className="title">{FINALE_TITLE}</h1>
          </div>
          {!atEnd && (
            <button type="button" className="ghost" onClick={skip}>
              {FINALE_END.skip}
            </button>
          )}
        </header>

        <div className="stage sc-corners" ref={wrapRef}>
          <canvas ref={canvasRef} role="img" aria-label={FINALE_SCENE_DESCRIPTION} />
          <span className="scan" aria-hidden="true" />
        </div>

        <div className="sr" role="status" aria-live="polite">{announce}</div>

        {showSpeech && (
          <div className="speech">
            <p className="speaker">Selena Chicago</p>
            {reduced ? (
              <>
                {FINALE_LINES.map((text) => (
                  <p key={text} className="said static">{text}</p>
                ))}
                <p className="sign">{FINALE_SIGNOFF}</p>
              </>
            ) : (
              <div aria-hidden="true">
                <p className="said">
                  {currentText}
                  {!lineIsDone && <span className="caret" />}
                </p>
                <p className="sign" style={{ visibility: showSign ? "visible" : "hidden" }}>{FINALE_SIGNOFF}</p>
              </div>
            )}
            {stage === "talk" || reduced ? (
              <button type="button" className="ghost next" onClick={advance}>
                {reduced ? "Next frame" : FINALE_END.next}
              </button>
            ) : null}
          </div>
        )}

        {atEnd && (
          <section className="end sc-corners" aria-labelledby={`${titleId}-end`}>
            <p className="kicker">{FINALE_END.label}</p>
            <h2 id={`${titleId}-end`} className="endTitle">{FINALE_END.heading}</h2>
            <p className="endBody">{FINALE_END.body}</p>
            <div className="actions">
              <button type="button" className="primary" ref={continueRef} onClick={onContinue}>
                {FINALE_END.cta}
              </button>
              <button type="button" className="ghost" onClick={replay}>
                {FINALE_END.replay}
              </button>
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .finale {
          color: var(--phosphor);
          background: var(--screen-base);
        }
        .finale.overlay {
          position: fixed;
          inset: 0;
          z-index: var(--z-modal);
          overflow-y: auto;
          padding: var(--space-md) var(--sp-3);
        }
        .finale.page {
          min-height: 100dvh;
          padding: var(--space-md) var(--sp-3);
        }
        .finale:focus {
          outline: none;
        }
        .inner {
          width: min(640px, 100%);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
        }
        .bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--sp-3);
        }
        .kicker {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .title {
          margin: var(--sp-1) 0 0;
          font-family: var(--font-display);
          font-size: var(--fs-h1);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .stage {
          position: relative;
          display: grid;
          justify-content: center;
          background: var(--screen-base);
          border: 1px solid var(--hairline);
          box-shadow: var(--screen-inset);
          padding: var(--sp-2);
        }
        canvas {
          display: block;
          image-rendering: pixelated;
          image-rendering: pixelated;
          filter: drop-shadow(0 0 6px rgba(var(--phosphor-glow), 0.22));
        }
        .scan {
          position: absolute;
          inset: var(--sp-2);
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 2px,
            color-mix(in srgb, var(--case-shadow) 28%, transparent) 2px,
            color-mix(in srgb, var(--case-shadow) 28%, transparent) 3px
          );
        }
        .sr {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        .speech {
          background: var(--paper-grain) var(--tan-200);
          text-shadow: none;
          border: 1px solid var(--tan-500);
          padding: var(--sp-3);
          display: grid;
          gap: var(--sp-2);
          min-height: 9.5rem;
          align-content: start;
        }
        .speaker {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--red-deep);
        }
        .said {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body);
          font-style: italic;
          color: var(--case-900);
          min-height: 3.2em;
        }
        .said.static {
          min-height: 0;
        }
        .sign {
          margin: 0;
          font-family: var(--font-body);
          font-style: italic;
          color: var(--red-deep);
        }
        .caret {
          display: inline-block;
          width: 0.5em;
          height: 1em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: var(--case-900);
          animation: caret 700ms steps(1) infinite;
        }
        @keyframes caret {
          50% {
            opacity: 0;
          }
        }
        .end {
          background: var(--card-elevated);
          border: 1px solid var(--hairline);
          padding: var(--space-lg) var(--sp-4);
          display: grid;
          gap: var(--sp-2);
          animation: end-in 320ms var(--ease-out);
        }
        .endTitle {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h1);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .endBody {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body);
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--sp-2);
          margin-top: var(--sp-2);
        }
        .primary,
        .ghost {
          min-height: var(--touch-min);
          padding: var(--sp-2) var(--sp-4);
          font: inherit;
          cursor: pointer;
          border: 1px solid var(--phosphor);
          text-shadow: none;
        }
        .primary {
          background: var(--phosphor);
          color: var(--case-900);
          font-weight: var(--fw-bold);
        }
        .ghost {
          background: transparent;
          color: var(--phosphor);
          text-shadow: var(--text-glow);
        }
        .ghost.next {
          justify-self: end;
          border-color: var(--tan-500);
          color: var(--case-900);
          text-shadow: none;
        }
        .primary:focus-visible,
        .ghost:focus-visible {
          outline: 2px solid var(--phosphor-hot);
          outline-offset: 2px;
        }
        .ghost.next:focus-visible {
          outline-color: var(--case-900);
        }
        @keyframes end-in {
          from {
            opacity: 0;
            transform: translateY(var(--sp-2));
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .end {
            animation: none;
          }
          .caret {
            animation: none;
          }
        }
      `}</style>
    </Root>
  );

  // The overlay is portaled to <body> so the game layout's stacking context
  // can't paint the TabBar over it.
  return variant === "overlay" && typeof document !== "undefined" ? createPortal(tree, document.body) : tree;
}

export default SeasonFinale;
