"use client";

import type { ReactNode } from "react";
import type { DataConfidence } from "@one-step-ahead/shared";
import type { PrimaryAction } from "@one-step-ahead/shared/season-one/primaryAction";
import type { PrimaryBeat } from "@one-step-ahead/shared/season-one/primaryBeat";
import type { ParticipationThresholdState } from "@one-step-ahead/shared/season-one/specialOperations";
import { withBase } from "../links";
import { SelenaLine } from "./RitualOverlay";

const numberFormat = new Intl.NumberFormat("en-US");

/* Shared card chrome for the chase surface. */
function ChaseCard({
  eyebrow,
  children,
  tone = "default",
  ariaLabel,
}: {
  eyebrow: string;
  children: ReactNode;
  tone?: "default" | "alert";
  ariaLabel?: string;
}) {
  return (
    <section className={tone === "alert" ? "chaseCard alert sc-corners" : "chaseCard sc-corners"} aria-label={ariaLabel ?? eyebrow}>
      <p className="eyebrow">[ {eyebrow} ]</p>
      {children}
      <style jsx>{`
        .chaseCard {
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
          padding: var(--sp-3) var(--sp-4);
          border: 1px solid var(--hairline);
          background: var(--screen-700);
          box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
          min-width: 0;
        }
        .chaseCard.alert {
          border-color: var(--signal-red);
        }
        .eyebrow {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .chaseCard.alert .eyebrow {
          color: var(--signal-red);
        }
      `}</style>
    </section>
  );
}

/** City/chapter header — the story-first frame above the chase console. */
export function ChapterHeader({
  weekNumber,
  totalWeeks,
  cityName,
  chapterTitle,
  complication,
  onReviewBriefing,
}: {
  weekNumber: number;
  totalWeeks: number;
  cityName: string;
  chapterTitle: string;
  complication: string | null;
  onReviewBriefing?: () => void;
}) {
  return (
    <header className="chapterHeader" aria-label={`Case ${weekNumber}: ${chapterTitle}`}>
      <p className="kicker">
        Case {String(weekNumber).padStart(2, "0")} of {totalWeeks} · <span className="kickerCity">{cityName}</span>
      </p>
      <div className="titleRow">
        <h1>{chapterTitle}</h1>
        {onReviewBriefing && (
          <button type="button" className="review" onClick={onReviewBriefing}>
            Review assignment
          </button>
        )}
      </div>
      {complication && <p className="complication">Weekly complication: {complication}</p>}
      <style jsx>{`
        .chapterHeader {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
        }
        .kicker {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .kickerCity {
          color: var(--signal-red);
        }
        .titleRow {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--sp-3);
          flex-wrap: wrap;
        }
        h1 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h2);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .review {
          min-height: var(--touch-min);
          padding: 0 var(--sp-3);
          background: transparent;
          border: 1px solid var(--hairline);
          color: var(--phosphor-dim);
          font: inherit;
          font-size: var(--fs-body-sm);
          cursor: pointer;
        }
        .review:focus-visible {
          outline: 2px solid var(--phosphor-hot);
          outline-offset: 2px;
        }
        .complication {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
      `}</style>
    </header>
  );
}

/** One deterministic primary action — the single dominant CTA. */
export function PrimaryActionCard({ action, onOpenBriefing, onOpenCaseResult }: {
  action: PrimaryAction;
  onOpenBriefing?: () => void;
  onOpenCaseResult?: () => void;
}) {
  const inPage = action.id === "view_briefing" ? onOpenBriefing
    : action.id === "view_case_result" ? onOpenCaseResult
    : undefined;
  return (
    <ChaseCard eyebrow="Priority directive" ariaLabel="Primary action">
      <h2 className="title">{action.title}</h2>
      {action.body && <p className="body">{action.body}</p>}
      {inPage ? (
        <button type="button" className="cta" onClick={inPage}>Open</button>
      ) : (
        action.href && <a className="cta" href={withBase(action.href)}>Open</a>
      )}
      <style jsx>{`
        .title {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h3);
          text-transform: uppercase;
          color: var(--phosphor);
        }
        .body {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor-dim);
        }
        .cta {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: var(--touch-min);
          padding: var(--sp-1) var(--sp-4);
          background: var(--phosphor);
          color: var(--case-900);
          font-weight: var(--fw-bold);
          border: 1px solid var(--phosphor);
          font: inherit;
          cursor: pointer;
          text-shadow: none;
        }
        .cta:focus-visible {
          outline: 2px solid var(--phosphor-hot);
          outline-offset: 2px;
        }
      `}</style>
    </ChaseCard>
  );
}

/** The one primary narrative beat on the chase surface. */
export function NarrativeBeatPanel({ beat }: { beat: PrimaryBeat }) {
  return (
    <ChaseCard
      eyebrow={beat.category === "trust" ? "System notice" : "Field report"}
      tone={beat.id === "sudden_death" ? "alert" : "default"}
      ariaLabel="Narrative beat"
    >
      <h2 className="headline">{beat.headline}</h2>
      <p className="body">{beat.body}</p>
      {beat.selena && <SelenaLine>{beat.selena}</SelenaLine>}
      {beat.ctaLabel && beat.ctaHref && (
        <a className="link" href={withBase(beat.ctaHref)}>{beat.ctaLabel}</a>
      )}
      <style jsx>{`
        .headline {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h3);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .body {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
          white-space: pre-line;
        }
        .link {
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
          text-decoration: underline;
        }
      `}</style>
    </ChaseCard>
  );
}

/** Trust notice — shown whenever data confidence is not verified. */
export function DataConfidenceNotice({
  dataConfidence,
  incompletePlayerCount,
}: {
  dataConfidence: DataConfidence;
  incompletePlayerCount: number;
}) {
  if (dataConfidence === "verified") return null;
  const copy = dataConfidence === "recalculating"
    ? "Late field reports arrived. Results are being reconciled."
    : dataConfidence === "incomplete"
      ? `Field reports incomplete — ${incompletePlayerCount} tracker${incompletePlayerCount === 1 ? "" : "s"} have not reported. Pursuit analysis is limited until they respond.`
      : "Some field reports are delayed. Current figures are estimates.";
  return (
    <p className="confidence" role="status">
      {copy}
      <style jsx>{`
        .confidence {
          margin: 0;
          padding: var(--sp-2) var(--sp-3);
          border: 1px dashed var(--hairline);
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor-dim);
        }
      `}</style>
    </p>
  );
}

/** Platform Sweep — the weekly special operation progress card. */
export function PlatformSweepCard({
  operation,
  fiction,
}: {
  operation: ParticipationThresholdState;
  fiction: string;
}) {
  return (
    <ChaseCard eyebrow={operation.label} ariaLabel={`${operation.label} special operation`}>
      <p className="fiction">{fiction}</p>
      <p className="status" role="status">
        <span className="count">{operation.contributors}</span> of{" "}
        <span className="count">{operation.eligiblePlayers}</span> operatives have contributed{" "}
        ({numberFormat.format(operation.minimumVerifiedStepsPerPlayer)}+ verified steps each)
      </p>
      <p className="tier">
        {operation.nextThresholdCount != null
          ? `Next bonus tier: ${operation.nextThresholdCount} operatives`
          : "Full bonus secured"}
        {" · "}earned +{Math.round(operation.earnedBonus * 1000) / 10}% of +{Math.round(operation.maxBonus * 1000) / 10}%
      </p>
      <style jsx>{`
        .fiction {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
        .status {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
        .count {
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          color: var(--phosphor-hot);
        }
        .tier {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-caption);
          color: var(--phosphor-dim);
        }
      `}</style>
    </ChaseCard>
  );
}

export interface SystemCardData {
  id: string;
  title: string;
  primary: string;
  secondary?: string;
  href: string;
}

/** Secondary Field Ops / Prediction / Nemesis cards + evidence preview. */
export function SystemCards({ cards }: { cards: SystemCardData[] }) {
  return (
    <div className="systemCards">
      {cards.map((card) => (
        <a className="systemCard sc-corners" href={withBase(card.href)} key={card.id}>
          <span className="cardTitle">{card.title}</span>
          <span className="cardPrimary">{card.primary}</span>
          {card.secondary && <span className="cardSecondary">{card.secondary}</span>}
        </a>
      ))}
      <style jsx>{`
        .systemCards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--space-sm);
        }
        .systemCard {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
          padding: var(--sp-3);
          border: 1px solid var(--hairline);
          background: var(--screen-700);
          box-shadow: var(--bevel-raised-shadow);
          min-height: var(--touch-min);
          min-width: 0;
        }
        .systemCard:hover,
        .systemCard:focus-visible {
          border-color: var(--phosphor-dim);
          outline: none;
        }
        .systemCard:focus-visible {
          outline: 2px solid var(--phosphor-hot);
          outline-offset: 2px;
        }
        .cardTitle {
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .cardPrimary {
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
        .cardSecondary {
          font-family: var(--font-body);
          font-size: var(--fs-caption);
          color: var(--phosphor-dim);
        }
      `}</style>
    </div>
  );
}
