"use client";

import type { SeasonWeekConfig } from "@one-step-ahead/shared/season-one/seasonOne";
import { RitualOverlay, RitualLabel } from "./RitualOverlay";

const numberFormat = new Intl.NumberFormat("en-US");

/**
 * Monday Briefing — full-screen ritual overlay opening the week's case.
 * Skippable (Escape / backdrop / primary CTA), reopenable from the chase
 * screen, reduced-motion compatible, copy entirely from Season One config.
 */
export function MondayBriefing({
  weekConfig,
  startingLead,
  onDismiss,
}: {
  weekConfig: SeasonWeekConfig;
  startingLead: number;
  onDismiss: () => void;
}) {
  return (
    <RitualOverlay labelledBy="briefing-title" onDismiss={onDismiss}>
      <RitualLabel>{weekConfig.briefing.label}</RitualLabel>
      <h1 id="briefing-title" className="title">{weekConfig.briefing.title}</h1>

      <div className="body">
        {weekConfig.briefing.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="lead" role="status">
        <span className="leadLabel">Selena&apos;s lead</span>
        <span className="leadNumber">{numberFormat.format(startingLead)}</span>
        <span className="leadLabel">steps</span>
      </div>
      <p className="supporting">Every verified step your unit takes closes the distance.</p>

      <ul className="systems">
        {weekConfig.briefing.supportingCards.map((card) => (
          <li key={card.id}>
            <span className="systemTitle">{card.title}</span>
            <span className="systemBody">{card.body}</span>
          </li>
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="primary" onClick={onDismiss}>
          {weekConfig.briefing.primaryCta}
        </button>
        <button type="button" className="secondary" onClick={onDismiss}>
          Skip briefing
        </button>
      </div>

      <style jsx>{`
        .title {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h2);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .body {
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
        }
        .body p {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body);
          color: var(--phosphor);
        }
        .lead {
          display: flex;
          align-items: baseline;
          gap: var(--sp-2);
          flex-wrap: wrap;
          padding: var(--sp-3);
          background: var(--screen-700);
          box-shadow: var(--screen-inset-shadow);
        }
        .leadLabel {
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .leadNumber {
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: clamp(28px, 5vw, 36px);
          line-height: 1;
          color: var(--signal-red);
        }
        .supporting {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor-dim);
        }
        .systems {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: var(--sp-2);
        }
        .systems li {
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-top: 1px solid var(--hairline);
          padding-top: var(--sp-2);
        }
        .systemTitle {
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .systemBody {
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
        .actions {
          display: flex;
          gap: var(--sp-3);
          flex-wrap: wrap;
          margin-top: var(--sp-2);
        }
        .primary,
        .secondary {
          min-height: var(--touch-min);
          padding: var(--sp-2) var(--sp-4);
          font: inherit;
          font-weight: var(--fw-bold);
          cursor: pointer;
        }
        .primary {
          background: var(--phosphor);
          color: var(--case-900);
          border: 1px solid var(--phosphor);
          text-shadow: none;
        }
        .secondary {
          background: transparent;
          color: var(--phosphor-dim);
          border: 1px solid var(--hairline);
        }
        .primary:focus-visible,
        .secondary:focus-visible {
          outline: 2px solid var(--phosphor-hot);
          outline-offset: 2px;
        }
      `}</style>
    </RitualOverlay>
  );
}
