"use client";

import { useMemo, useState } from "react";
import type { DataConfidence, WeekPhase, WeeklyOutcome } from "@one-step-ahead/shared";
import {
  DEFAULT_WEEK_SIMULATOR_CONTROLS,
  WEEK_SIMULATOR_CONFIDENCE,
  WEEK_SIMULATOR_OUTCOMES,
  WEEK_SIMULATOR_PHASES,
  buildWeekSimulatorState,
  progressForOutcome,
  type WeekSimulatorControls,
} from "@/lib/weekSimulator";

const enabled = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_WEEK_SIMULATOR === "1";

const fieldOpsOptions = [
  { value: 0, label: "No lines" },
  { value: 1, label: "1 line/player" },
  { value: 2, label: "2 lines/player" },
  { value: 3, label: "3 lines/player" },
] as const;

const platformSweepOptions = [
  { value: 0, label: "Placeholder off" },
  { value: 0.01, label: "40% tier" },
  { value: 0.02, label: "60% tier" },
  { value: 0.03, label: "80% tier" },
] as const;

const nemesisOptions = [
  { value: "none", label: "No qualifying activity" },
  { value: "partial", label: "70% activity" },
  { value: "complete", label: "Resolved participation" },
] as const;

export default function WeekSimulatorPage() {
  const [controls, setControls] = useState<WeekSimulatorControls>(DEFAULT_WEEK_SIMULATOR_CONTROLS);
  const state = useMemo(() => buildWeekSimulatorState(controls), [controls]);

  if (!enabled) {
    return (
      <main className="simShell disabled">
        <section className="terminalPanel sc-corners">
          <p className="eyebrow">DEV TOOL DISABLED</p>
          <h1>Week Simulator</h1>
          <p>This development-only tool is hidden unless the app runs in development or enables the simulator flag.</p>
        </section>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="simShell">
      <section className="header">
        <p className="eyebrow">DEV WEEK SIMULATOR</p>
        <h1>Week 1: {state.seasonState.chapter.title}</h1>
        <p>
          Uses production Season One config and pure calculators. This page does not write data and is not linked from game navigation.
        </p>
      </section>

      <section className="layout">
        <form className="controls terminalPanel sc-corners" aria-label="Week simulator controls">
          <label>
            Phase
            <select
              value={controls.phase}
              onChange={(event) => update({ phase: event.target.value as WeekPhase })}
            >
              {WEEK_SIMULATOR_PHASES.map((phase) => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
          </label>

          <label>
            Outcome preset
            <select
              value={controls.outcome}
              onChange={(event) => {
                const outcome = event.target.value as WeeklyOutcome;
                update({ outcome, baseProgress: progressForOutcome(outcome) });
              }}
            >
              {WEEK_SIMULATOR_OUTCOMES.map((outcome) => (
                <option key={outcome} value={outcome}>{outcome}</option>
              ))}
            </select>
          </label>

          <label>
            Data confidence
            <select
              value={controls.dataConfidence}
              onChange={(event) => update({ dataConfidence: event.target.value as DataConfidence })}
            >
              {WEEK_SIMULATOR_CONFIDENCE.map((confidence) => (
                <option key={confidence} value={confidence}>{confidence}</option>
              ))}
            </select>
          </label>

          <label>
            Base chase progress: {percent(controls.baseProgress)}
            <input
              type="range"
              min="0"
              max="1.2"
              step="0.01"
              value={controls.baseProgress}
              onChange={(event) => update({ baseProgress: Number(event.target.value) })}
            />
          </label>

          <label>
            Field Ops progress
            <select
              value={controls.fieldOpsAverageLines}
              onChange={(event) => update({ fieldOpsAverageLines: Number(event.target.value) as WeekSimulatorControls["fieldOpsAverageLines"] })}
            >
              {fieldOpsOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            Platform Sweep placeholder
            <select
              value={controls.platformSweepBonus}
              onChange={(event) => update({ platformSweepBonus: Number(event.target.value) as WeekSimulatorControls["platformSweepBonus"] })}
            >
              {platformSweepOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            Nemesis participation
            <select
              value={controls.nemesisMode}
              onChange={(event) => update({ nemesisMode: event.target.value as WeekSimulatorControls["nemesisMode"] })}
            >
              {nemesisOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={controls.predictionSubmitted}
              onChange={(event) => update({ predictionSubmitted: event.target.checked })}
            />
            Prediction submitted by all players
          </label>
        </form>

        <section className="preview">
          <div className="terminalPanel sc-corners">
            <p className="eyebrow">{state.seasonState.chapter.city}</p>
            <h2>{state.seasonState.chapter.title}</h2>
            <dl className="stats">
              <div>
                <dt>Phase</dt>
                <dd>{state.seasonState.phase}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{state.seasonState.dataConfidence}</dd>
              </div>
              <div>
                <dt>Primary action</dt>
                <dd>{state.seasonState.primaryAction.id}</dd>
              </div>
              <div>
                <dt>Remaining lead</dt>
                <dd>{formatNumber(state.seasonState.chase.remainingLead)} steps</dd>
              </div>
            </dl>
          </div>

          <div className="terminalPanel sc-corners">
            <h2>Chase Calculation</h2>
            <dl className="stats">
              <div>
                <dt>Verified steps</dt>
                <dd>{formatNumber(state.seasonState.chase.verifiedGroupSteps)}</dd>
              </div>
              <div>
                <dt>Target</dt>
                <dd>{formatNumber(state.seasonState.chase.groupWeeklyTarget)}</dd>
              </div>
              <div>
                <dt>Base progress</dt>
                <dd>{percent(state.seasonState.chase.baseProgress)}</dd>
              </div>
              <div>
                <dt>Final progress</dt>
                <dd>{percent(state.seasonState.chase.finalProgress)}</dd>
              </div>
              <div>
                <dt>Projected outcome</dt>
                <dd>{state.seasonState.chase.projectedOutcome ?? "withheld"}</dd>
              </div>
              <div>
                <dt>Final outcome</dt>
                <dd>{state.seasonState.chase.finalOutcome ?? "not finalized"}</dd>
              </div>
            </dl>
          </div>

          <div className="terminalPanel sc-corners">
            <h2>Bonuses</h2>
            <dl className="stats">
              <div>
                <dt>Field Ops</dt>
                <dd>{percent(state.seasonState.chase.bonuses.fieldOps)}</dd>
              </div>
              <div>
                <dt>Platform Sweep</dt>
                <dd>{percent(state.platformSweep.earnedBonus)} placeholder</dd>
              </div>
              <div>
                <dt>Nemesis</dt>
                <dd>{percent(state.seasonState.chase.bonuses.nemesisParticipation)}</dd>
              </div>
              <div>
                <dt>Prediction</dt>
                <dd>{percent(state.seasonState.chase.bonuses.predictionParticipation)}</dd>
              </div>
              <div>
                <dt>Total non-step</dt>
                <dd>{percent(state.seasonState.chase.bonuses.total)}</dd>
              </div>
            </dl>
          </div>
        </section>
      </section>

      <style jsx>{styles}</style>
    </main>
  );

  function update(patch: Partial<WeekSimulatorControls>) {
    setControls((current) => ({ ...current, ...patch }));
  }
}

function percent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

const styles = `
  .simShell {
    min-height: 100svh;
    background: var(--screen-base);
    color: var(--phosphor);
    padding: clamp(1rem, 3vw, 2rem);
  }

  .disabled {
    display: grid;
    place-items: center;
  }

  .header {
    max-width: 72rem;
    margin: 0 auto 1.5rem;
  }

  .header h1,
  .terminalPanel h1,
  .terminalPanel h2 {
    margin: 0;
    color: var(--phosphor-hot);
    letter-spacing: 0;
  }

  .header p,
  .terminalPanel p {
    max-width: 62rem;
    color: var(--phosphor-dim);
  }

  .eyebrow {
    margin: 0 0 0.5rem;
    font-size: 0.78rem;
    text-transform: uppercase;
    color: var(--phosphor-dim);
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(18rem, 24rem) 1fr;
    gap: 1rem;
    max-width: 72rem;
    margin: 0 auto;
    align-items: start;
  }

  .terminalPanel {
    border: 1px solid var(--grid-line);
    background: var(--screen-700);
    padding: 1rem;
    box-shadow: var(--screen-inset-shadow);
  }

  .controls {
    display: grid;
    gap: 1rem;
  }

  label {
    display: grid;
    gap: 0.4rem;
    color: var(--phosphor-dim);
    font-size: 0.92rem;
  }

  select,
  input[type="range"] {
    width: 100%;
  }

  select {
    min-height: var(--touch-min);
    background: var(--screen-base);
    color: var(--phosphor);
    border: 1px solid var(--grid-line);
    padding: 0.55rem;
    font: inherit;
  }

  input[type="range"] {
    accent-color: var(--phosphor-hot);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .checkbox input {
    width: 1rem;
    height: 1rem;
  }

  .preview {
    display: grid;
    gap: 1rem;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin: 1rem 0 0;
  }

  .stats div {
    border-top: 1px solid var(--grid-line);
    padding-top: 0.5rem;
  }

  dt {
    color: var(--phosphor-dim);
    font-size: 0.76rem;
    text-transform: uppercase;
  }

  dd {
    margin: 0.2rem 0 0;
    color: var(--phosphor-hot);
    overflow-wrap: anywhere;
  }

  @media (max-width: 820px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .stats {
      grid-template-columns: 1fr;
    }
  }
`;
