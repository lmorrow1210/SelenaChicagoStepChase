"use client";

import type { DataConfidence, WeeklyOutcome } from "@one-step-ahead/shared";
import type { SeasonWeekConfig, RitualVariantCopy } from "@one-step-ahead/shared/season-one/seasonOne";
import { RitualOverlay, RitualLabel, SelenaLine } from "./RitualOverlay";

const numberFormat = new Intl.NumberFormat("en-US");

/** Fill {{token}} placeholders in config copy with runtime values. */
function fillTemplate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_match, key) => String(params[key] ?? ""));
}

function midweekVariant(
  weekConfig: SeasonWeekConfig,
  dataConfidence: DataConfidence,
  projectedOutcome: WeeklyOutcome | null,
): RitualVariantCopy {
  const midweek = weekConfig.rituals.midweek;
  if (dataConfidence !== "verified" && dataConfidence !== "estimated") return midweek.incompleteData;
  if (projectedOutcome === "interception") return midweek.strongPace;
  if (projectedOutcome === "trail_lost") return midweek.recoveryNeeded;
  return midweek.expectedPace;
}

/**
 * Wednesday Midweek Field Update — a dismissible, reopenable ritual modal.
 * Variant selection mirrors the primary-beat rules; Selena speaks only on
 * verified data, and the incomplete-data variant carries Bureau copy only.
 */
export function FieldUpdateModal({
  weekConfig,
  dataConfidence,
  projectedOutcome,
  remainingLead,
  daysRemaining,
  fieldOpsBonusRemaining,
  specialOperationBonusRemaining,
  firstLineComplete,
  groupName,
  gapClosedPercent,
  onDismiss,
}: {
  weekConfig: SeasonWeekConfig;
  dataConfidence: DataConfidence;
  projectedOutcome: WeeklyOutcome | null;
  remainingLead: number;
  daysRemaining: number;
  fieldOpsBonusRemaining: number;
  specialOperationBonusRemaining: number;
  firstLineComplete: boolean;
  groupName: string;
  gapClosedPercent: number;
  onDismiss: () => void;
}) {
  const variant = midweekVariant(weekConfig, dataConfidence, projectedOutcome);
  const showRecoveryPlan = variant === weekConfig.rituals.midweek.recoveryNeeded;
  return (
    <RitualOverlay labelledBy="midweek-title" onDismiss={onDismiss}>
      <RitualLabel>Midweek field update</RitualLabel>
      <h1 id="midweek-title" className="headline">{variant.headline}</h1>
      <p className="body">
        {fillTemplate(variant.body, { groupName, gapClosedPercent: Math.round(gapClosedPercent * 100) })}
      </p>
      {variant.selena && dataConfidence === "verified" && <SelenaLine>{variant.selena}</SelenaLine>}

      {showRecoveryPlan && (
        <dl className="recovery">
          <div>
            <dt>Remaining lead</dt>
            <dd>{numberFormat.format(remainingLead)} steps</dd>
          </div>
          <div>
            <dt>Days remaining</dt>
            <dd>{daysRemaining}</dd>
          </div>
          <div>
            <dt>Field Ops bonus available</dt>
            <dd>+{Math.round(fieldOpsBonusRemaining * 1000) / 10}%</dd>
          </div>
          <div>
            <dt>{weekConfig.specialOperation.label} available</dt>
            <dd>+{Math.round(specialOperationBonusRemaining * 1000) / 10}%</dd>
          </div>
        </dl>
      )}

      {firstLineComplete && (
        <div className="reveal">
          <p className="revealHeadline">{weekConfig.rituals.midweek.storyReveal.headline}</p>
          <p className="revealBody">{weekConfig.rituals.midweek.storyReveal.body}</p>
        </div>
      )}

      <button type="button" className="primary" onClick={onDismiss}>
        {variant.cta ?? "Back to the pursuit"}
      </button>

      <style jsx>{`
        .headline {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h2);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .body {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body);
          color: var(--phosphor);
          white-space: pre-line;
        }
        .recovery {
          margin: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--sp-2);
        }
        .recovery div {
          border-top: 1px solid var(--hairline);
          padding-top: var(--sp-1);
        }
        .recovery dt {
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .recovery dd {
          margin: 2px 0 0;
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          color: var(--phosphor);
        }
        .reveal {
          padding: var(--sp-3);
          background: var(--screen-700);
          box-shadow: var(--screen-inset-shadow);
          display: grid;
          gap: var(--sp-1);
        }
        .revealHeadline {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .revealBody {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
          white-space: pre-line;
        }
        .primary {
          align-self: flex-start;
          min-height: var(--touch-min);
          padding: var(--sp-2) var(--sp-4);
          background: var(--phosphor);
          color: var(--case-900);
          border: 1px solid var(--phosphor);
          font: inherit;
          font-weight: var(--fw-bold);
          cursor: pointer;
          text-shadow: none;
        }
        .primary:focus-visible {
          outline: 2px solid var(--phosphor-hot);
          outline-offset: 2px;
        }
      `}</style>
    </RitualOverlay>
  );
}

/**
 * Friday Final Push — a persistent banner with one projected outcome and
 * the concrete remaining opportunities. Projection is withheld when data
 * confidence is insufficient.
 */
export function FinalPushAlert({
  weekConfig,
  dataConfidence,
  projectedOutcome,
  remainingLead,
  fieldOpsBonusRemaining,
  specialOperationBonusRemaining,
}: {
  weekConfig: SeasonWeekConfig;
  dataConfidence: DataConfidence;
  projectedOutcome: WeeklyOutcome | null;
  remainingLead: number;
  fieldOpsBonusRemaining: number;
  specialOperationBonusRemaining: number;
}) {
  const headlines: Record<WeeklyOutcome, string> = {
    trail_lost: "TRAIL LOSS PROJECTED",
    pursuit_maintained: "PURSUIT MAINTAINED PROJECTED",
    close_encounter: "CLOSE ENCOUNTER PROJECTED",
    interception: "INTERCEPTION PROJECTED",
  };
  const projection = dataConfidence === "verified" && projectedOutcome
    ? headlines[projectedOutcome]
    : null;
  return (
    <aside className="finalPush sc-corners" aria-label="Final push">
      <p className="label">[ {weekConfig.rituals.finalPush.label} ]</p>
      <p className="projection">{projection ?? "FINAL VERIFIED REPORTS DECIDE THE CASE"}</p>
      <p className="detail">
        {numberFormat.format(remainingLead)} pursuit steps remain before Sunday 11:59 PM.
      </p>
      {(fieldOpsBonusRemaining > 0 || specialOperationBonusRemaining > 0) && (
        <ul className="paths">
          {fieldOpsBonusRemaining > 0 && (
            <li>Complete another Field Ops milestone: up to +{Math.round(fieldOpsBonusRemaining * 1000) / 10}%</li>
          )}
          {specialOperationBonusRemaining > 0 && (
            <li>Finish {weekConfig.specialOperation.label}: up to +{Math.round(specialOperationBonusRemaining * 1000) / 10}%</li>
          )}
        </ul>
      )}
      {dataConfidence === "verified" && <SelenaLine>{weekConfig.rituals.finalPush.selena}</SelenaLine>}
      <style jsx>{`
        .finalPush {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
          padding: var(--sp-3) var(--sp-4);
          border: 1px solid var(--phosphor);
          background: var(--phosphor-08);
        }
        .label {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .projection {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h3);
          text-transform: uppercase;
          color: var(--phosphor);
        }
        .detail {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
        .paths {
          margin: 0;
          padding-left: var(--sp-4);
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
      `}</style>
    </aside>
  );
}

/**
 * Saturday sudden death — the one earned use of the strongest red-alert
 * treatment outside critical system states.
 */
export function SuddenDeathAlert({ weekConfig }: { weekConfig: SeasonWeekConfig }) {
  return (
    <aside className="suddenDeath sc-corners" aria-label="Nemesis sudden death" role="status">
      <p className="headline">{weekConfig.rituals.suddenDeath.headline}</p>
      <p className="body">{weekConfig.rituals.suddenDeath.body}</p>
      <style jsx>{`
        .suddenDeath {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
          padding: var(--sp-3) var(--sp-4);
          border: 2px solid var(--signal-red);
          background: var(--red-12);
        }
        .headline {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h3);
          text-transform: uppercase;
          color: var(--signal-red);
        }
        .body {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
      `}</style>
    </aside>
  );
}

/**
 * Sunday-night Case Closing — the controlled reconciliation state between
 * the cutoff and the authoritative Monday result.
 */
export function CaseClosingState({
  weekConfig,
  trackerWarning,
}: {
  weekConfig: SeasonWeekConfig;
  trackerWarning: string | null;
}) {
  const closing = weekConfig.rituals.caseClosing;
  return (
    <section className="caseClosing sc-corners" aria-label="Case closing" role="status">
      <p className="headline">{closing.headline}</p>
      <p className="body">{closing.body}</p>
      <p className="supporting">{closing.supporting}</p>
      {trackerWarning && <p className="warning">{trackerWarning}</p>}
      <style jsx>{`
        .caseClosing {
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
          padding: var(--space-lg);
          border: 1px solid var(--hairline);
          background: var(--screen-700);
          box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
          text-align: center;
        }
        .headline {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h2);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .body {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body);
          color: var(--phosphor);
        }
        .supporting {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor-dim);
        }
        .warning {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--signal-red);
        }
      `}</style>
    </section>
  );
}
