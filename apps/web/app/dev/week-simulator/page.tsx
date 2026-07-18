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
import { MondayBriefing } from "@/lib/narrative/MondayBriefing";
import { CaseClosedReport } from "@/lib/narrative/CaseClosedReport";
import {
  CaseClosingState,
  FieldUpdateModal,
  FinalPushAlert,
  SuddenDeathAlert,
} from "@/lib/narrative/RitualSurfaces";
import {
  ChapterHeader,
  DataConfidenceNotice,
  NarrativeBeatPanel,
  PlatformSweepCard,
  PrimaryActionCard,
} from "@/lib/narrative/ChaseCards";
import { EvidenceBoard } from "@/lib/narrative/EvidenceBoard";

const enabled = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_WEEK_SIMULATOR === "1";

const fieldOpsOptions = [
  { value: 0, label: "No lines" },
  { value: 1, label: "1 line/player" },
  { value: 2, label: "2 lines/player" },
  { value: 3, label: "3 lines/player" },
] as const;

const nemesisOptions = [
  { value: "none", label: "No qualifying activity" },
  { value: "partial", label: "70% activity" },
  { value: "complete", label: "Resolved participation" },
] as const;

export default function WeekSimulatorPage() {
  const [controls, setControls] = useState<WeekSimulatorControls>(DEFAULT_WEEK_SIMULATOR_CONTROLS);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [midweekOpen, setMidweekOpen] = useState(false);
  const [caseReportOpen, setCaseReportOpen] = useState(false);
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

  const season = state.seasonState;
  const weekConfig = state.weekConfig;
  const showPrimaryBeat = !(season.phase === "final_push" && season.primaryBeat.id.startsWith("final_push"));

  return (
    <main className="simShell">
      {briefingOpen && (
        <MondayBriefing
          weekConfig={weekConfig}
          startingLead={season.chase.groupWeeklyTarget}
          onDismiss={() => {
            setBriefingOpen(false);
            update({ briefingViewed: true });
          }}
        />
      )}
      {midweekOpen && (
        <FieldUpdateModal
          weekConfig={weekConfig}
          dataConfidence={season.dataConfidence}
          projectedOutcome={season.chase.projectedOutcome}
          remainingLead={season.chase.remainingLead}
          daysRemaining={4}
          fieldOpsBonusRemaining={Math.max(0, 0.05 - season.chase.bonuses.fieldOps)}
          specialOperationBonusRemaining={Math.max(0, season.platformSweep.maxBonus - season.platformSweep.earnedBonus)}
          firstLineComplete={controls.fieldOpsAverageLines > 0}
          groupName="The Night Walkers"
          gapClosedPercent={season.chase.finalProgress}
          onDismiss={() => setMidweekOpen(false)}
        />
      )}
      {caseReportOpen && (
        <CaseClosedReport
          weekConfig={weekConfig}
          data={{
            outcome: controls.outcome,
            groupName: "The Night Walkers",
            groupTotalSteps: season.chase.verifiedGroupSteps,
            groupTargetSteps: season.chase.groupWeeklyTarget,
            finalProgress: season.chase.finalProgress,
            bonuses: season.chase.bonuses,
            interceptUnlocked: controls.outcome === "interception",
            dataConfidence: season.dataConfidence,
          }}
          onDismiss={() => setCaseReportOpen(false)}
        />
      )}

      <section className="header">
        <p className="eyebrow">DEV WEEK SIMULATOR</p>
        <h1>Week 1: {season.chapter.title}</h1>
        <p>
          Renders the production narrative components with the real Season One config, chase
          calculator, phase service, and beat selector. This page writes no data and is not
          linked from game navigation.
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
                update({
                  outcome,
                  baseProgress: progressForOutcome(outcome),
                  interceptUnlocked: controls.interceptUnlocked && outcome === "interception",
                });
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
            Platform Sweep contributors: {controls.platformSweepContributors} of 4
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={controls.platformSweepContributors}
              onChange={(event) => update({ platformSweepContributors: Number(event.target.value) as WeekSimulatorControls["platformSweepContributors"] })}
            />
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={controls.platformSweepActive}
              onChange={(event) => update({ platformSweepActive: event.target.checked })}
            />
            Platform Sweep window open (Fri–Sat)
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

          <label className="checkbox">
            <input
              type="checkbox"
              checked={controls.briefingViewed}
              onChange={(event) => update({ briefingViewed: event.target.checked })}
            />
            Briefing viewed
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={controls.evidenceUnlocked}
              onChange={(event) => update({ evidenceUnlocked: event.target.checked })}
            />
            Standard evidence unlocked
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={controls.interceptUnlocked}
              onChange={(event) => update({ interceptUnlocked: event.target.checked, evidenceUnlocked: event.target.checked ? true : controls.evidenceUnlocked })}
            />
            Intercept Clue unlocked
          </label>

          <div className="triggerRow">
            <button type="button" onClick={() => setBriefingOpen(true)}>Trigger briefing</button>
            <button type="button" onClick={() => setMidweekOpen(true)}>Trigger midweek update</button>
            <button type="button" onClick={() => setCaseReportOpen(true)}>Trigger case closed</button>
            <button
              type="button"
              onClick={() => {
                setControls(DEFAULT_WEEK_SIMULATOR_CONTROLS);
                setBriefingOpen(false);
                setMidweekOpen(false);
                setCaseReportOpen(false);
              }}
            >
              Reset Week 1
            </button>
          </div>
        </form>

        <section className="preview">
          {/* ── Production narrative surfaces ── */}
          <ChapterHeader
            weekNumber={season.season.weekNumber}
            totalWeeks={season.season.totalWeeks}
            cityName={season.chapter.city}
            chapterTitle={season.chapter.title}
            complication={season.chapter.complication}
            onReviewBriefing={() => setBriefingOpen(true)}
          />
          <DataConfidenceNotice
            dataConfidence={season.dataConfidence}
            incompletePlayerCount={season.sync.incompletePlayerCount}
          />
          {season.phase === "case_closing" && (
            <CaseClosingState
              weekConfig={weekConfig}
              trackerWarning={season.sync.incompletePlayerCount > 0
                ? `${season.sync.incompletePlayerCount} trackers have not reported. Final results may change after synchronization.`
                : null}
            />
          )}
          {season.phase === "sudden_death" && <SuddenDeathAlert weekConfig={weekConfig} />}
          {season.phase === "final_push" && (
            <FinalPushAlert
              weekConfig={weekConfig}
              dataConfidence={season.dataConfidence}
              projectedOutcome={season.chase.projectedOutcome}
              remainingLead={season.chase.remainingLead}
              fieldOpsBonusRemaining={Math.max(0, 0.05 - season.chase.bonuses.fieldOps)}
              specialOperationBonusRemaining={Math.max(0, season.platformSweep.maxBonus - season.platformSweep.earnedBonus)}
            />
          )}
          <div className="cardsRow">
            <PrimaryActionCard
              action={season.primaryAction}
              onOpenBriefing={() => setBriefingOpen(true)}
              onOpenCaseResult={() => setCaseReportOpen(true)}
            />
            {showPrimaryBeat && <NarrativeBeatPanel beat={season.primaryBeat} />}
          </div>
          {season.platformSweep.active && (
            <PlatformSweepCard
              operation={season.platformSweep}
              fiction={weekConfig.rituals.specialOperationFiction}
            />
          )}

          {/* ── Calculator readouts ── */}
          <div className="terminalPanel sc-corners">
            <h2>Chase Calculation</h2>
            <dl className="stats">
              <div>
                <dt>Verified steps</dt>
                <dd>{formatNumber(season.chase.verifiedGroupSteps)}</dd>
              </div>
              <div>
                <dt>Target</dt>
                <dd>{formatNumber(season.chase.groupWeeklyTarget)}</dd>
              </div>
              <div>
                <dt>Base progress</dt>
                <dd>{percent(season.chase.baseProgress)}</dd>
              </div>
              <div>
                <dt>Final progress</dt>
                <dd>{percent(season.chase.finalProgress)}</dd>
              </div>
              <div>
                <dt>Remaining lead</dt>
                <dd>{formatNumber(season.chase.remainingLead)} steps</dd>
              </div>
              <div>
                <dt>Projected outcome</dt>
                <dd>{season.chase.projectedOutcome ?? "withheld"}</dd>
              </div>
              <div>
                <dt>Final outcome</dt>
                <dd>{season.chase.finalOutcome ?? "not finalized"}</dd>
              </div>
              <div>
                <dt>Phase / confidence</dt>
                <dd>{season.phase} / {season.dataConfidence}</dd>
              </div>
            </dl>
          </div>

          <div className="terminalPanel sc-corners">
            <h2>Bonuses</h2>
            <dl className="stats">
              <div>
                <dt>Field Ops</dt>
                <dd>{percent(season.chase.bonuses.fieldOps)}</dd>
              </div>
              <div>
                <dt>Platform Sweep</dt>
                <dd>{percent(season.chase.bonuses.specialOperation)}</dd>
              </div>
              <div>
                <dt>Nemesis</dt>
                <dd>{percent(season.chase.bonuses.nemesisParticipation)}</dd>
              </div>
              <div>
                <dt>Prediction</dt>
                <dd>{percent(season.chase.bonuses.predictionParticipation)}</dd>
              </div>
              <div>
                <dt>Total non-step</dt>
                <dd>{percent(season.chase.bonuses.total)}</dd>
              </div>
            </dl>
          </div>

          {/* ── Evidence board (production component) ── */}
          <EvidenceBoard board={state.evidenceBoard} />
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
    max-width: 76rem;
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
    grid-template-columns: minmax(18rem, 22rem) 1fr;
    gap: 1rem;
    max-width: 76rem;
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
    position: sticky;
    top: 1rem;
    max-height: calc(100svh - 2rem);
    overflow-y: auto;
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

  .triggerRow {
    display: grid;
    gap: 0.5rem;
  }

  .triggerRow button {
    min-height: var(--touch-min);
    background: transparent;
    border: 1px solid var(--grid-line);
    color: var(--phosphor);
    font: inherit;
    cursor: pointer;
    padding: 0.4rem 0.75rem;
  }

  .triggerRow button:hover,
  .triggerRow button:focus-visible {
    border-color: var(--phosphor);
    outline: none;
  }

  .preview {
    display: grid;
    gap: 1rem;
    min-width: 0;
  }

  .cardsRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .controls {
      position: static;
      max-height: none;
    }

    .stats {
      grid-template-columns: 1fr;
    }
  }
`;
