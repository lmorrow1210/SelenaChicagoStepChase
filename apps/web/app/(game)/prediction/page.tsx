"use client";

import Avatar from "@selenas-chase/design-system/components/game/Avatar";
import type { ColorwayId } from "@selenas-chase/design-system/components/game/Avatar";
import PredictionCard from "@selenas-chase/design-system/components/game/PredictionCard";
import EmptyState from "@selenas-chase/design-system/components/feedback/EmptyState";
import Skeleton from "@selenas-chase/design-system/components/feedback/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { api, ApiError } from "../../../lib/api";
import { useSession } from "../../../lib/session";

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

function usePredictionData(enabled: boolean) {
  return useQuery({
    queryKey: ["predictions", "current"],
    queryFn: () => api<PredictionPayload>("/api/predictions/current"),
    enabled,
  });
}

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

function LoadingPrediction() {
  return (
    <main className="predictionPage" aria-busy="true">
      <Skeleton preset="block" style={{ height: "var(--sp-9)", borderRadius: "var(--r-card)" }} />
      <Skeleton rows={3} />
      <PredictionStyles />
    </main>
  );
}

export default function PredictionPage() {
  const session = useSession();
  const prediction = usePredictionData(Boolean(session.user));
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

  if (session.loading) return <LoadingPrediction />;

  if (!session.user) {
    return (
      <main className="predictionPage">
        <EmptyState
          icon="prediction"
          title="Sign in"
          body="Your weekly guess is waiting."
          action={
            <a className="predictionAction" href="/login">
              Continue
            </a>
          }
        />
        <PredictionStyles />
      </main>
    );
  }

  if (prediction.isLoading) return <LoadingPrediction />;

  if (prediction.isError || !prediction.data) {
    return (
      <main className="predictionPage">
        <EmptyState
          icon="prediction"
          title={session.group ? "Prediction unavailable" : "No group yet"}
          body={session.group ? "Try again in a minute." : "Create or join a team to make a prediction."}
          action={
            session.group ? undefined : (
              <a className="predictionAction" href="/onboarding">
                Start
              </a>
            )
          }
        />
        <PredictionStyles />
      </main>
    );
  }

  const data = prediction.data;
  const submitted = Boolean(data.myPrediction);
  const revealedRows =
    data.others === "hidden"
      ? []
      : [data.myPrediction, ...data.others].filter((row): row is PredictionRow => Boolean(row));

  return (
    <main className="predictionPage">
      <section className="predictionGrid">
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
            <p className="predictionNote">Prediction window is closed for this week.</p>
          )}
        </div>

        <aside className="predictionSide">
          <div className="sidePanel">
            <p className="eyebrow">Group total</p>
            <strong>{formatNumber(data.liveGroupTotal)}</strong>
          </div>

          <div className="sidePanel">
            <div className="sideHeader">
              <h2>Group guesses</h2>
              <span>{data.state}</span>
            </div>

            {data.others === "hidden" ? (
              <p className="muted">Reveals {revealLabel(data.revealAt)}</p>
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
        </aside>
      </section>

      <PredictionStyles />
    </main>
  );
}

function PredictionStyles() {
  return (
    <style jsx global>{`
      .predictionPage {
        min-height: 100dvh;
        padding: var(--sp-5);
      }

      .predictionGrid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: var(--sp-5);
        align-items: start;
      }

      .predictionSide {
        display: flex;
        flex-direction: column;
        gap: var(--sp-4);
      }

      .sidePanel {
        border: 1px solid var(--hairline);
        border-radius: var(--r-card);
        background: var(--card);
        box-shadow: var(--shadow-card);
        padding: var(--sp-4);
      }

      .eyebrow,
      .sideHeader span {
        margin: var(--sp-0);
        font-family: var(--font-body);
        font-size: var(--fs-label);
        font-weight: var(--fw-medium);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--muted);
      }

      .sidePanel > strong {
        display: block;
        margin-top: var(--sp-2);
        color: var(--cream);
        font-family: var(--font-mono);
        font-size: var(--fs-data);
        line-height: var(--lh-data);
      }

      .sideHeader {
        display: flex;
        justify-content: space-between;
        gap: var(--sp-3);
        align-items: center;
        margin-bottom: var(--sp-3);
      }

      h2 {
        margin: var(--sp-0);
        font-family: var(--font-display);
        font-size: var(--fs-h3);
        line-height: var(--lh-heading);
        text-transform: uppercase;
        color: var(--cream);
      }

      .muted,
      .predictionNote,
      .predictionError {
        margin: var(--sp-0);
        color: var(--muted);
      }

      .predictionError {
        margin-top: var(--sp-3);
        color: var(--red);
      }

      .predictionNote {
        margin-top: var(--sp-3);
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

      .predictionAction {
        min-height: var(--touch-min);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--r-pill);
        background: var(--blue);
        color: var(--navy);
        font-weight: var(--fw-bold);
      }

      @media (max-width: 767px) {
        .predictionPage {
          padding: var(--sp-4);
        }

        .predictionGrid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}
