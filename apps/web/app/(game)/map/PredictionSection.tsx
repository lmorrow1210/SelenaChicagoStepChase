"use client";

import Avatar from "@selenas-chase/design-system/components/game/Avatar";
import type { ColorwayId } from "@selenas-chase/design-system/components/game/Avatar";
import PredictionCard from "@selenas-chase/design-system/components/game/PredictionCard";
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
          <p className="eyebrow">Call her next move</p>
          <h2>How far does the team get this week?</h2>
        </div>
        <span className="predictionState">{data.state}</span>
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
            <div className="guessList">
              {revealedRows.map((row) => (
                <div className="guessRow" key={row.user_id}>
                  <Avatar size={32} colorway={colorwayFrom(row.avatar_colorway)} />
                  <span>{row.display_name}</span>
                  <strong>{formatNumber(row.predicted_steps)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .predictionPanel {
          border: 1px solid var(--hairline);
          border-radius: var(--r-card);
          background: var(--card);
          box-shadow: var(--shadow-card);
          padding: var(--sp-4);
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
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
          font-size: var(--fs-h3);
          line-height: var(--lh-heading);
          text-transform: uppercase;
          color: var(--cream);
        }

        .predictionState {
          font-family: var(--font-body);
          font-size: var(--fs-label);
          font-weight: var(--fw-medium);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--muted);
        }

        .predictionBody {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
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
          font-size: var(--fs-h3);
          line-height: var(--lh-heading);
          text-transform: uppercase;
          color: var(--cream);
        }

        .guessList {
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
        }

        .guessRow {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: var(--sp-3);
        }

        .guessRow span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--cream);
          font-weight: var(--fw-medium);
        }

        .guessRow strong {
          color: var(--blue);
          font-family: var(--font-mono);
        }

        .predictionError {
          margin: var(--sp-3) var(--sp-0) var(--sp-0);
          color: var(--red);
        }

        .predictionNote {
          margin: var(--sp-0);
          color: var(--muted);
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
