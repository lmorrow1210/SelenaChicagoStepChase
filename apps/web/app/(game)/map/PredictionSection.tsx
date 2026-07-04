"use client";

import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import type { ColorwayId } from "@one-step-ahead/design-system/components/game/Avatar";
import PredictionCard from "@one-step-ahead/design-system/components/game/PredictionCard";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

/** Slider bounds — generous room above the live pace, rounded to clean 10k. */
function sliderMax(liveTotal: number): number {
  const base = Math.max(250_000, liveTotal * 1.5);
  return Math.ceil(base / 10_000) * 10_000;
}

/**
 * The weekly prediction console — a large slider with a synced numeric
 * input files the forecast; once everyone's calls unseal they render on
 * a horizontal range track with the live group total as the amber
 * `current` marker.
 */
export function PredictionSection() {
  const prediction = useQuery({
    queryKey: ["predictions", "current"],
    queryFn: () => api<PredictionPayload>("/api/predictions/current"),
  });
  const [steps, setSteps] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitPrediction(predicted_steps: number) {
    if (!predicted_steps) {
      setError("Dial in a forecast first");
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

  // No week / no group: the map's own empty states cover it.
  if (prediction.isLoading || prediction.isError || !prediction.data) return null;

  const data = prediction.data;
  const submitted = Boolean(data.myPrediction);
  const max = sliderMax(data.liveGroupTotal);
  const value = steps ?? Math.max(data.liveGroupTotal, Math.round(max / 2 / 1000) * 1000);
  const revealedRows =
    data.others === "hidden"
      ? []
      : [data.myPrediction, ...data.others].filter((row): row is PredictionRow => Boolean(row));
  const filedTeammates = data.others === "hidden" ? [] : data.others;

  return (
    <section className="predictionPanel" aria-label="Weekly prediction">
      <div className="predictionHeader">
        <div>
          <p className="eyebrow">[ Call her next move ]</p>
          <h2>How far does the team get this week?</h2>
        </div>
      </div>

      <div className="predictionBody">
        <div>
          <PredictionCard
            city={data.city.name}
            value={value}
            min={0}
            max={max}
            step={1000}
            submitted={submitted}
            prediction={data.myPrediction ? formatNumber(data.myPrediction.predicted_steps) : formatNumber(value)}
            onChange={(next: number) => setSteps(next)}
            onSubmit={() => {
              if (!submitting) void submitPrediction(value);
            }}
            stakeNote="Stake: the closest call takes Oracle honors when the board seals Sunday 11:59 PM."
            teammates={
              filedTeammates.length > 0 ? (
                <div className="teammatePreview">
                  <span className="teammatePreviewLabel">Already filed:</span>
                  {filedTeammates.map((row) => (
                    <span className="teammatePreviewChip" key={row.user_id} title={row.display_name}>
                      <Avatar size={20} colorway={colorwayFrom(row.avatar_colorway)} />
                      {row.display_name}
                    </span>
                  ))}
                </div>
              ) : undefined
            }
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
            <p className="predictionNote">Sealed until Sunday 11:59 PM</p>
          ) : (
            <RangeChart rows={revealedRows} liveTotal={data.liveGroupTotal} colorwayFrom={colorwayFrom} />
          )}
        </div>
      </div>

      <style jsx global>{`
        .predictionPanel {
          border: 1px solid var(--hairline);
          border-radius: var(--r-card);
          background: var(--screen-700);
          box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .predictionPanel .eyebrow {
          margin: 0;
          font-family: var(--font-display);
          font-weight: var(--fw-semibold);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }

        .predictionHeader {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: var(--space-sm);
        }

        .predictionHeader h2 {
          margin: var(--space-2xs) 0 0;
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h3);
          line-height: var(--lh-heading);
          text-transform: uppercase;
          color: var(--phosphor);
        }

        .predictionBody {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: var(--space-md);
          align-items: start;
        }

        .teammatePreview {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-xs);
        }
        .teammatePreviewLabel {
          font-family: var(--font-display);
          font-weight: var(--fw-semibold);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .teammatePreviewChip {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2xs);
          padding: var(--space-2xs) var(--space-xs);
          border: 1px solid var(--hairline);
          background: var(--screen-700);
          font-family: var(--font-body);
          font-size: var(--fs-caption);
          color: var(--phosphor);
        }

        .guessPanel {
          border: 1px solid var(--hairline);
          border-radius: var(--r-card);
          padding: var(--space-sm);
        }

        .guessHeader h3 {
          margin: 0 0 var(--space-sm);
          font-family: var(--font-display);
          font-weight: var(--fw-semibold);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }

        /* Range chart — calls as ticks on one horizontal track */
        .rangeChart {
          position: relative;
          padding: var(--space-xl) var(--space-xs) var(--space-xs);
          background: var(--screen-700);
          border-radius: var(--r-tight);
          box-shadow: var(--screen-inset-shadow);
        }
        .rangeAxis {
          position: relative;
          height: 2px;
          margin: 34px 10px 56px;
          background: var(--hairline);
        }
        .rangeBound {
          position: absolute;
          bottom: -20px;
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: 9px;
          color: var(--phosphor-dim);
          white-space: nowrap;
        }
        .rangeBound[data-edge="min"] {
          left: 0;
        }
        .rangeBound[data-edge="max"] {
          right: 0;
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
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: 10px;
          color: var(--phosphor-dim);
          white-space: nowrap;
        }
        .rangeTick[data-winner="true"] .tickValue {
          color: var(--phosphor-hot);
        }
        .rangeLive {
          position: absolute;
          top: -12px;
          bottom: -12px;
          width: 2px;
          transform: translateX(-50%);
          background: var(--phosphor);
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
          color: var(--phosphor);
          white-space: nowrap;
        }

        /* Compact legend fallback — used when ticks would collide */
        .rangeLegend {
          display: flex;
          flex-direction: column;
          gap: var(--space-2xs);
          margin: 0;
          padding: var(--space-xs);
          list-style: none;
          background: var(--screen-700);
          box-shadow: var(--screen-inset-shadow);
        }
        .rangeLegendRow {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: var(--space-xs);
        }
        .rangeLegendRow .legendName {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: var(--font-body);
          font-size: var(--fs-caption);
          color: var(--phosphor);
        }
        .rangeLegendRow .legendValue {
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: var(--fs-caption);
          color: var(--phosphor-dim);
        }
        .rangeLegendRow[data-winner="true"] .legendValue {
          color: var(--phosphor-hot);
        }
        .rangeLegendRow[data-live="true"] .legendName,
        .rangeLegendRow[data-live="true"] .legendValue {
          color: var(--phosphor);
        }

        .predictionError {
          margin: var(--space-sm) 0 0;
          color: var(--signal-red);
        }

        .predictionNote {
          margin: 0;
          font-size: var(--fs-body-sm);
          color: var(--phosphor-dim);
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

/** The team's calls on one horizontal range track — each call is a tick with
    a staggered label row; the live group total is the amber `current` marker.
    When ticks would collide, falls back to a compact legend list. */
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

  const sorted = [...rows].sort((a, b) => a.predicted_steps - b.predicted_steps);
  const positions = sorted.map((row) => pos(row.predicted_steps));

  // Pins closer than ~9% collide even with staggered labels — fall back to
  // the compact legend so every call stays readable.
  const tooClose = positions.some((p, i) => i > 0 && p - positions[i - 1] < 9);
  if (tooClose) {
    return (
      <ul className="rangeLegend" aria-label="The team's step calls">
        {liveTotal > 0 && (
          <li className="rangeLegendRow" data-live="true">
            <span aria-hidden="true" style={{ width: 20 }} />
            <span className="legendName">current</span>
            <span className="legendValue">{formatNumber(liveTotal)}</span>
          </li>
        )}
        {sorted.map((row) => (
          <li className="rangeLegendRow" data-winner={row.is_winner ? "true" : "false"} key={row.user_id}>
            <Avatar size={20} colorway={colorwayFrom(row.avatar_colorway)} ring={row.is_winner ? "var(--phosphor-hot)" : undefined} />
            <span className="legendName">{row.display_name}</span>
            <span className="legendValue">{formatNumber(row.predicted_steps)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="rangeChart" role="img" aria-label="Range of the team's step calls">
      <div className="rangeAxis">
        <span className="rangeBound" data-edge="min">{formatNumber(min)}</span>
        <span className="rangeBound" data-edge="max">{formatNumber(max)}</span>
        {liveTotal > 0 && (
          <>
            <span className="rangeLive" style={{ left: `${pos(liveTotal)}%` }} />
            <span className="rangeLiveLabel" style={{ left: `${pos(liveTotal)}%` }}>
              current {formatNumber(liveTotal)}
            </span>
          </>
        )}
        {sorted.map((row, i) => (
          <span
            key={row.user_id}
            className="rangeTick"
            data-winner={row.is_winner ? "true" : "false"}
            style={{ left: `${pos(row.predicted_steps)}%` }}
            title={`${row.display_name}: ${formatNumber(row.predicted_steps)}`}
          >
            <span className="tickAvatar">
              <Avatar size={24} colorway={colorwayFrom(row.avatar_colorway)} ring={row.is_winner ? "var(--phosphor-hot)" : undefined} />
            </span>
            {/* Staggered label rows keep neighbouring calls legible */}
            <span className="tickValue" style={{ top: i % 2 === 0 ? 12 : 28 }}>
              {formatNumber(row.predicted_steps)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
