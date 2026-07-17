"use client";

import type { WeeklyOutcome } from "@one-step-ahead/shared";
import {
  getEvidence,
  type SeasonWeekConfig,
} from "@one-step-ahead/shared/season-one/seasonOne";
import { withBase } from "../links";
import { RitualOverlay, RitualLabel, SelenaLine } from "./RitualOverlay";

const numberFormat = new Intl.NumberFormat("en-US");

export interface CaseClosedData {
  outcome: WeeklyOutcome;
  groupName: string;
  groupTotalSteps: number | null;
  groupTargetSteps: number;
  finalProgress: number | null;
  bonuses: Record<string, number> | null;
  interceptUnlocked: boolean;
  dataConfidence: string;
}

const OUTCOME_MARKERS: Record<WeeklyOutcome, string> = {
  trail_lost: "CASE FILED",
  pursuit_maintained: "CITY STAMPED",
  close_encounter: "NEAR CAPTURE",
  interception: "INTERCEPTION",
};

/**
 * Case Closed — one vertically scrolling report: outcome, story
 * consequence, evidence, group accomplishments, and the next-city teaser.
 * All copy comes from the week's Season One config; every outcome
 * continues to the same next city.
 */
export function CaseClosedReport({
  weekConfig,
  data,
  onDismiss,
}: {
  weekConfig: SeasonWeekConfig;
  data: CaseClosedData;
  onDismiss: () => void;
}) {
  const close = weekConfig.closeCopy[data.outcome];
  const standardEvidence = getEvidence(weekConfig.evidence.standardEvidenceId);
  const interceptClue = getEvidence(weekConfig.evidence.interceptClueId);
  const teaser = weekConfig.nextCityTeaser;
  const evidenceBody = data.outcome === "trail_lost"
    ? standardEvidence?.basicBody ?? standardEvidence?.body
    : data.outcome === "close_encounter" || data.outcome === "interception"
      ? standardEvidence?.enhancedBody ?? standardEvidence?.body
      : standardEvidence?.body;

  return (
    <RitualOverlay labelledBy="case-closed-title" onDismiss={onDismiss} wide>
      <RitualLabel>
        Case {String(weekConfig.weekNumber).padStart(2, "0")} · {weekConfig.cityName} · {OUTCOME_MARKERS[data.outcome]}
      </RitualLabel>
      <h1 id="case-closed-title" className={data.outcome === "interception" ? "headline intercepted" : "headline"}>
        {close.headline}
      </h1>

      <p className="story">{fill(close.story, data.groupName)}</p>
      <SelenaLine>{close.selena}</SelenaLine>

      <section className="reportSection" aria-label="Recovered evidence">
        <h2>Recovered evidence</h2>
        {standardEvidence && (
          <div className="evidence">
            <p className="evidenceTitle">{standardEvidence.title}</p>
            <p className="evidenceBody">{evidenceBody}</p>
          </div>
        )}
        {data.interceptUnlocked && interceptClue && (
          <div className="evidence intercept">
            <p className="evidenceTitle">{interceptClue.title} · INTERCEPT CLUE</p>
            <p className="evidenceBody">{interceptClue.body}</p>
          </div>
        )}
        <a className="boardLink" href={withBase("/evidence")}>View the evidence board</a>
      </section>

      <section className="reportSection" aria-label="Group accomplishments">
        <h2>Unit report</h2>
        <dl className="stats">
          <div>
            <dt>Verified steps</dt>
            <dd>{data.groupTotalSteps != null ? numberFormat.format(data.groupTotalSteps) : "—"}</dd>
          </div>
          <div>
            <dt>Weekly target</dt>
            <dd>{numberFormat.format(data.groupTargetSteps)}</dd>
          </div>
          <div>
            <dt>Final pursuit progress</dt>
            <dd>{data.finalProgress != null ? `${Math.round(data.finalProgress * 1000) / 10}%` : "—"}</dd>
          </div>
          <div>
            <dt>Bonus systems</dt>
            <dd>{data.bonuses ? `+${Math.round((data.bonuses.total ?? 0) * 1000) / 10}%` : "—"}</dd>
          </div>
        </dl>
        <p className="statsNote">
          Individual results — Oracle, nemesis outcome, and badges — are stamped on profiles and the trophy page.
        </p>
      </section>

      <section className="reportSection teaser" aria-label="Next city">
        <h2>{teaser.header}</h2>
        <p className="teaserBody">{teaser.body}</p>
        <SelenaLine>{teaser.selena}</SelenaLine>
        <button type="button" className="primary" onClick={onDismiss}>
          {teaser.cta}
        </button>
      </section>

      <style jsx>{`
        .headline {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h1);
          text-transform: uppercase;
          color: var(--phosphor-hot);
        }
        .headline.intercepted {
          color: var(--signal-red);
        }
        .story {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body);
          color: var(--phosphor);
          white-space: pre-line;
        }
        .reportSection {
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
          border-top: 1px solid var(--hairline);
          padding-top: var(--sp-3);
        }
        .reportSection h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .evidence {
          padding: var(--sp-3);
          background: var(--paper-grain) var(--tan-200);
          text-shadow: none;
          display: grid;
          gap: var(--sp-1);
        }
        .evidence.intercept {
          border: 1px solid var(--signal-red);
        }
        .evidenceTitle {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--case-900);
        }
        .evidenceBody {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--case-800);
        }
        .boardLink {
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
          text-decoration: underline;
        }
        .stats {
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--sp-2);
        }
        .stats div {
          border-top: 1px solid var(--hairline);
          padding-top: var(--sp-1);
        }
        .stats dt {
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .stats dd {
          margin: 2px 0 0;
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          color: var(--phosphor);
        }
        .statsNote {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-caption);
          color: var(--phosphor-dim);
        }
        .teaserBody {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body);
          color: var(--phosphor);
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

function fill(template: string, groupName: string): string {
  return template.replace(/\{\{groupName\}\}/g, groupName);
}
