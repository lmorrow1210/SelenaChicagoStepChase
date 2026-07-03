"use client";

import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import type { ColorwayId } from "@one-step-ahead/design-system/components/game/Avatar";
import PredictionCard from "@one-step-ahead/design-system/components/game/PredictionCard";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { api, ApiError } from "../../../lib/api";

type PredictionState = "pending" | "partial" | "revealed" | "final";

interface PredictionRow {
  user_id: string;
  predicted_steps: number;
  submitted_at: string;
  actual_delta: number | null;
  is_winner: boolean;
  display_name: string;
  avatar_skin: number;
  avatar_hair: number;
  avatar_colorway: number;
}

interface PredictionPayload {
  week: { id: string; starts_on: string; ends_on: string; status: "active" | "closed" };
  city: { name: string };
  myPrediction: PredictionRow | null;
  others: PredictionRow[] | "hidden";
  allSubmitted: boolean;
  liveGroupTotal: number;
  revealAt: string;
  state: PredictionState;
  submissionOpen: boolean;
}

const COLORWAYS: ColorwayId[] = ["chicago", "midnight", "emerald", "crimson", "desert", "violet"];
const numberFormat = new Intl.NumberFormat("en-US");

function colorwayFrom(value: number): ColorwayId {
  return COLORWAYS[Math.max(0, value - 1) % COLORWAYS.length];
}

function formatNumber(value: number): string {
  return numberFormat.format(value);
}

function parseSteps(value: string): number {
  return Number(value.replace(/[^\d]/g, ""));
}

function revealLabel(value: string): string {
  return new Date(value).toLocaleString([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * The weekly prediction, embedded on the Map so the whole chase lives on
 * one screen (was its own tab).
 */
export function PredictionSection() {
  const prediction = useQuery({
    queryKey: ["predictions", "current"],
    queryFn: () => api<PredictionPayload>("/api/predictions/current"),
  });
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitPrediction() {
    const predicted_steps = parseSteps(value);
    if (!predicted_steps) {
      setError("Enter a number first");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api("/api/predictions", {
        method: "POST",
        body: JSON.stringify({ predicted_steps }),
      });
      await prediction.refetch();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Prediction failed");
    } finally {
      setSubmitting(false);
    }
  }

  function changeValue(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(/[^\d]/g, "");
    setValue(next ? formatNumber(Number(next)) : "");
  }

  // No week / no group: the map's own empty states cover it.
  if (prediction.isLoading || prediction.isError || !prediction.data) return null;

  const data = prediction.data;
  const submitted = Boolean(data.myPrediction);
  const revealedRows =
    data.others === "hidden"
      ? []
      : [data.myPrediction, ...data.others].filter((row): row is PredictionRow => Boolean(row));

  return (
    <section className="predictionPanel" aria-label="Weekly prediction">
      <div className="predictionHeader">
        <div>
          <p className="eyebrow">[ Call her next move ]</p>
          <h2>How far does the team get this week?</h2>
        </div>
        <span className="predictionCountdown" title="Predictions reveal">
          Resets {revealLabel(data.revealAt)}
        </span>
      </div>

      <div className="predictionBody">
        <div>
          <PredictionCard
            city={data.city.name}
            value={value}
            submitted={submitted}
            prediction={data.myPrediction ? formatNumber(data.myPrediction.predicted_steps) : value}
            onChange={changeValue}
            onSubmit={() => {
              if (!submitting) void submitPrediction();
            }}
          />
          {error && <p className="predictionError">{error}</p>}
          {!data.submissionOpen && !submitted && (
            <p className="predictionNote">Calls lock on Mondays — back next week.</p>
          )}
        </div>

        <div className="guessPanel">
          <div className="guessHeader">
            <h3>The team&apos;s calls</h3>
          </div>
          {data.others === "hidden" ? (
            <p className="predictionNote">Sealed until {revealLabel(data.revealAt)}</p>
          ) : (
            <RangeChart rows={revealedRows} liveTotal={data.liveGroupTotal} colorwayFrom={colorwayFrom} />
          )}
        </div>
      </div>

      <style jsx global>{`
        .predictionPanel {
          border: 1px solid var(--hairline);
          border-radius: var(--r-card);
          background: var(--ink-700);
          box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
          padding: var(--sp-4);
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
        }

        .predictionPanel .eyebrow {
          margin: 0;
          font-family: var(--font-display);
          font-weight: var(--fw-semibold);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--bone-dim);
        }

        .predictionHeader {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: var(--sp-3);
        }

        .predictionHeader h2 {
          margin: var(--sp-1) var(--sp-0) var(--sp-0);
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h3);
          line-height: var(--lh-heading);
          text-transform: uppercase;
          color: var(--bone);
        }

        /* Visible reveal countdown — amber mono pill */
        .predictionCountdown {
          flex: none;
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: var(--fs-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--amber);
          background: var(--ink-800);
          border-radius: var(--r-tight);
          box-shadow: var(--screen-inset-shadow);
          padding: var(--sp-1) var(--sp-2);
          white-space: nowrap;
        }

        .predictionBody {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: var(--sp-4);
          align-items: start;
        }

        .guessPanel {
          border: 1px solid var(--hairline);
          border-radius: var(--r-card);
          padding: var(--sp-3);
        }

        .guessHeader h3 {
          margin: var(--sp-0) var(--sp-0) var(--sp-3);
          font-family: var(--font-display);
          font-weight: var(--fw-semibold);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--bone-dim);
        }

        /* Mini range chart — calls as ticks on one axis */
        .rangeChart {
          position: relative;
          padding: var(--sp-4) var(--sp-2) var(--sp-2);
          background: var(--ink-800);
          border-radius: var(--r-tight);
          box-shadow: var(--screen-inset-shadow);
        }
        .rangeAxis {
          position: relative;
          height: 2px;
          margin: 34px 10px 26px;
          background: var(--hairline);
        }
        .rangeTick {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .rangeTick .tickAvatar {
          transform: translateY(-16px);
        }
        .rangeTick .tickValue {
          position: absolute;
          top: 12px;
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: 10px;
          color: var(--manila);
          white-space: nowrap;
        }
        .rangeTick[data-winner="true"] .tickValue {
          color: var(--amber-hot);
        }
        .rangeLive {
          position: absolute;
          top: -12px;
          bottom: -12px;
          width: 2px;
          transform: translateX(-50%);
          background: var(--amber);
          box-shadow: var(--glow-live);
        }
        .rangeLiveLabel {
          position: absolute;
          top: -26px;
          transform: translateX(-50%);
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--amber);
          white-space: nowrap;
        }

        .predictionError {
          margin: var(--sp-3) var(--sp-0) var(--sp-0);
          color: var(--signal-red);
        }

        .predictionNote {
          margin: var(--sp-0);
          font-size: var(--fs-body-sm);
          color: var(--bone-dim);
        }

        @media (max-width: 767px) {
          .predictionBody {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

/** The team's calls as a mini range chart (§9B) — each call is a tick on a
    shared axis; the live group total is an amber marker line. */
function RangeChart({
  rows,
  liveTotal,
  colorwayFrom,
}: {
  rows: PredictionRow[];
  liveTotal: number;
  colorwayFrom: (value: number) => ColorwayId;
}) {
  if (!rows.length) return <p className="predictionNote">No calls yet.</p>;

  const values = rows.map((r) => r.predicted_steps).concat(liveTotal > 0 ? [liveTotal] : []);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pos = (v: number) => 8 + ((v - min) / span) * 84; // keep ticks inside the axis

  return (
    <div className="rangeChart" role="img" aria-label="Range of the team's step calls">
      <div className="rangeAxis">
        {liveTotal > 0 && (
          <>
            <span className="rangeLive" style={{ left: `${pos(liveTotal)}%` }} />
            <span className="rangeLiveLabel" style={{ left: `${pos(liveTotal)}%` }}>
              live {formatNumber(liveTotal)}
            </span>
          </>
        )}
        {rows.map((row) => (
          <span
            key={row.user_id}
            className="rangeTick"
            data-winner={row.is_winner ? "true" : "false"}
            style={{ left: `${pos(row.predicted_steps)}%` }}
            title={`${row.display_name}: ${formatNumber(row.predicted_steps)}`}
          >
            <span className="tickAvatar">
              <Avatar size={24} colorway={colorwayFrom(row.avatar_colorway)} ring={row.is_winner ? "var(--amber-hot)" : undefined} />
            </span>
            <span className="tickValue">{formatNumber(row.predicted_steps)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
