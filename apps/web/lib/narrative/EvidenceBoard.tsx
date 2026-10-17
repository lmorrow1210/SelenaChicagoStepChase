"use client";

import type { WeeklyOutcome } from "@one-step-ahead/shared";

export interface EvidenceSlot {
  id: string;
  kind: "standard" | "intercept";
  title: string;
  body: string | null;
  highlightedFragment: string | null;
  iconKey: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface EvidenceBoardData {
  season: { id: string; title: string; totalWeeks: number };
  interceptionCount: number;
  finaleDepthTier: number;
  weeks: Array<{
    weekNumber: number;
    cityName: string;
    chapterTitle: string;
    outcome: WeeklyOutcome | null;
    standardEvidence: EvidenceSlot;
    interceptClue: EvidenceSlot;
  }>;
}

const OUTCOME_MARKERS: Record<WeeklyOutcome, string> = {
  trail_lost: "TRAIL LOST",
  pursuit_maintained: "PURSUIT MAINTAINED",
  close_encounter: "CLOSE ENCOUNTER",
  interception: "INTERCEPTED",
};

/**
 * Season One Evidence Board — a simple responsive 13-slot grid. Locked
 * slots show sealed placeholders only; no drag-and-drop, strings, or pins.
 */
export function EvidenceBoard({ board }: { board: EvidenceBoardData }) {
  const recovered = board.weeks.filter((week) => week.standardEvidence.unlocked).length;
  // Only the next case to close gets the full "how to recover this" hint; the
  // rest of the sealed slots collapse to a single line so recovered evidence
  // is what the eye lands on, not a wall of identical padlocks.
  const nextSealed = board.weeks.findIndex((week) => !week.standardEvidence.unlocked);
  return (
    <section className="board" aria-label="Chase evidence board">
      <header className="boardHeader">
        <p className="seasonKicker">The Chase · {board.season.title}</p>
        <p className="tally" role="status">
          Recovered: <span className="tallyNumber">{recovered}</span> of {board.season.totalWeeks}
          {" · "}
          Interceptions: <span className="tallyNumber">{board.interceptionCount}</span> of {board.season.totalWeeks}
        </p>
      </header>

      <ol className="slots">
        {board.weeks.map((week, index) => (
          <li
            className={
              week.standardEvidence.unlocked
                ? "slot unlocked sc-corners"
                : index === nextSealed
                  ? "slot next sc-corners"
                  : "slot compact"
            }
            key={week.weekNumber}
          >
            <p className="slotKicker">
              Week {String(week.weekNumber).padStart(2, "0")} · <span className="slotCity">{week.cityName}</span>
            </p>
            {week.standardEvidence.unlocked ? (
              <>
                <p className="slotTitle">{week.standardEvidence.title}</p>
                {week.standardEvidence.body && <p className="slotBody">{week.standardEvidence.body}</p>}
                {week.outcome && (
                  <p className={week.outcome === "interception" ? "marker intercepted" : "marker"}>
                    {OUTCOME_MARKERS[week.outcome]}
                  </p>
                )}
                {week.interceptClue.unlocked && (
                  <div className="interceptClue">
                    <p className="interceptTitle">INTERCEPT CLUE · {week.interceptClue.title}</p>
                    {week.interceptClue.body && <p className="slotBody">{week.interceptClue.body}</p>}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="slotTitle sealed">SEALED</p>
                <p className={index === nextSealed ? "slotBody dim" : "slotBody dim sr"}>
                  {week.chapterTitle
                    ? `Close the ${week.cityName} case to recover this evidence.`
                    : "Evidence pending."}
                </p>
              </>
            )}
          </li>
        ))}
      </ol>

      <style jsx>{`
        .board {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .boardHeader {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--sp-3);
          flex-wrap: wrap;
        }
        .seasonKicker,
        .tally {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .tallyNumber {
          font-family: var(--font-mono);
          color: var(--phosphor-hot);
        }
        .slots {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: var(--space-sm);
        }
        .slot {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
          padding: var(--sp-3);
          border: 1px dashed var(--hairline);
          background: var(--screen-700);
          min-width: 0;
        }
        .slot.compact {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--sp-2);
          padding: var(--sp-2) var(--sp-3);
        }
        .slot.compact .slotTitle {
          flex: none;
          white-space: nowrap;
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
        }
        .slot.next {
          border-style: solid;
          border-color: var(--phosphor-dim);
        }
        .slotBody.sr {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        .slot {
          position: relative;
        }
        .slot.unlocked {
          border-style: solid;
          box-shadow: var(--bevel-raised-shadow);
        }
        .slotKicker {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        /* City names are routine labels, not threats — red stays rare. */
        .slotCity {
          color: var(--phosphor-hot);
        }
        .slotTitle {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h3);
          text-transform: uppercase;
          color: var(--phosphor-hot);
          overflow-wrap: anywhere;
        }
        .slotTitle.sealed {
          color: var(--phosphor-dim);
        }
        .slotBody {
          margin: 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
        .slotBody.dim {
          color: var(--phosphor-dim);
        }
        .marker {
          margin: 0;
          align-self: flex-start;
          padding: 2px var(--sp-2);
          border: 1px solid var(--phosphor-dim);
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .marker.intercepted {
          border-color: var(--signal-red);
          color: var(--signal-red);
        }
        .interceptClue {
          margin-top: var(--sp-1);
          padding: var(--sp-2);
          border: 1px solid var(--signal-red);
          display: grid;
          gap: var(--sp-1);
        }
        .interceptTitle {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--signal-red);
        }
      `}</style>
    </section>
  );
}
