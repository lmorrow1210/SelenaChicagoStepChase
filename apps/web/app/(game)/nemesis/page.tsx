"use client";

import SkyscraperPair from "@one-step-ahead/design-system/components/game/SkyscraperPair";
import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import type { ColorwayId } from "@one-step-ahead/design-system/components/game/Avatar";
import Button from "@one-step-ahead/design-system/components/core/Button";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import Icon from "@one-step-ahead/design-system/components/icons/Icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../../../lib/api";
import { useSession } from "../../../lib/session";
import { SundayCountdown } from "../../../lib/SundayCountdown";
import { useSeasonWeek } from "../../../lib/narrative/useSeasonWeek";
import { useState } from "react";

const COLORWAYS: ColorwayId[] = ["chicago", "midnight", "emerald", "crimson", "desert", "violet"];

function colorwayFrom(n: number): ColorwayId {
  return COLORWAYS[((n ?? 1) - 1) % COLORWAYS.length];
}

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface DayResult {
  date: string;
  a_steps: number;
  b_steps: number;
  winner: "a" | "b" | "tie";
}

interface PlayerInfo {
  user_id: string;
  display_name: string;
  avatar_skin: number;
  avatar_hair: number;
  avatar_colorway: number;
  steps_today: number;
  steps_this_week: number;
}

interface NemesisPayload {
  matchup: {
    id: string;
    player_a: string;
    player_b: string;
    score_a: number;
    score_b: number;
    status: "active" | "tiebreak" | "complete";
    daily_results: DayResult[];
    rerolled: boolean;
    tiebreaker_date: string | null;
    winner_id: string | null;
  } | null;
  you: PlayerInfo | null;
  nemesis: PlayerInfo | null;
  week: { starts_on: string; ends_on: string };
  today: string;
  weekMax: number;
  outcome: "a" | "b" | "tiebreak" | null;
  state: "scheduled" | "active" | "tiebreak" | "complete" | "bye" | "no_matchup";
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function useNemesisData(enabled: boolean) {
  return useQuery<NemesisPayload>({
    queryKey: ["nemesis", "current"],
    queryFn: () => api<NemesisPayload>("/api/nemesis/current"),
    enabled,
    staleTime: 60_000,
  });
}

/* VS cabinet (§9E) — split-screen dueling panel: your phosphor corner vs their
   tan corner, big condensed VS plate, best-of-5 score in mono. */
function ScoreBar({
  you,
  nemesis,
  youScore,
  nemesisScore,
}: {
  you: PlayerInfo;
  nemesis: PlayerInfo;
  youScore: number;
  nemesisScore: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: "var(--sp-2)",
        padding: "var(--sp-4) var(--sp-3)",
        background:
          "linear-gradient(105deg, var(--phosphor-08) 0%, var(--screen-700) 42%, var(--screen-700) 58%, var(--slate-08) 100%)",
        borderRadius: "var(--r-card)",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--bevel-raised-shadow), var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      {/* split seam */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, bottom: 0, left: "50%",
          width: 1, background: "var(--hairline)", transform: "skewX(-12deg)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Avatar size={52} colorway={colorwayFrom(you.avatar_colorway)} ring="var(--phosphor)" />
        <span
          style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20,
            textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--phosphor)",
          }}
        >
          You
        </span>
      </div>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div
          style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--phosphor-dim)",
          }}
        >
          vs
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontVariantNumeric: "tabular-nums",
            fontSize: 34,
            lineHeight: 1,
            color: "var(--phosphor)",
            letterSpacing: "0.05em",
          }}
        >
          {youScore}–{nemesisScore}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10,
            textTransform: "uppercase", letterSpacing: "var(--ls-label)", color: "var(--phosphor-dim)",
            marginTop: 2,
          }}
        >
          Best of 5
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Avatar size={52} colorway={colorwayFrom(nemesis.avatar_colorway)} ring="var(--slate-light)" />
        <span
          style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20,
            textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--slate-light)",
            maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {nemesis.display_name}
        </span>
      </div>
    </div>
  );
}

function Banner({
  tone,
  icon,
  title,
  body,
}: {
  tone: "gold" | "red";
  icon: string;
  title: string;
  body: string;
}) {
  const color = tone === "gold" ? "var(--gold)" : "var(--red)";
  const bg = tone === "gold" ? "var(--gold-20)" : "var(--red-12)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-3)",
        padding: "var(--sp-3) var(--sp-4)",
        background: bg,
        borderRadius: "var(--r-card)",
        border: `1.5px solid ${color}`,
      }}
    >
      <span style={{ color }}>
        <Icon name={icon as any} size={28} />
      </span>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color,
          }}
        >
          {title}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
          {body}
        </div>
      </div>
    </div>
  );
}

/* Live pacing readout — the delta is a red odometer when you're behind
   (time pressure), phosphor when you're ahead. */
function TodayContextStrip({ you, nemesis }: { you: PlayerInfo; nemesis: PlayerInfo }) {
  const delta = you.steps_today - nemesis.steps_today;
  const behind = delta < 0;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: "var(--sp-3)",
        padding: "var(--sp-2) var(--sp-3)",
        background: "var(--screen-700)",
        borderRadius: "var(--r-tight)",
        boxShadow: "var(--screen-inset-shadow)",
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontSize: "clamp(11px, 3vw, 13px)", color: "var(--phosphor)" }}>
        You {you.steps_today.toLocaleString()}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          /* fluid: stays on one line on phones for typical deltas */
          fontSize: "clamp(12px, 3vw, 16px)",
          lineHeight: 1.25,
          whiteSpace: "nowrap",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: delta === 0 ? "var(--phosphor-dim)" : behind ? "var(--signal-red)" : "var(--phosphor-hot)",
          textShadow: behind ? "0 0 10px rgba(255,59,48,0.30)" : "none",
        }}
      >
        {delta === 0
          ? "Dead even"
          : behind
            ? `▼ ${Math.abs(delta).toLocaleString()} behind today`
            : `▲ ${delta.toLocaleString()} ahead today`}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontSize: "clamp(11px, 3vw, 13px)", color: "var(--slate-light)" }}>
        {nemesis.steps_today.toLocaleString()} {nemesis.display_name}
      </span>
    </div>
  );
}

interface LedgerDay {
  label: string;
  date: string;
  youSteps: number;
  nemSteps: number;
  outcome: "you" | "nemesis" | "tie" | "progress";
  kind: "done" | "today" | "future";
}

/* Compact Mon–Fri ledger — one row per day: steps, delta (phosphor-hot ahead / muted
   behind), and the day's result. Today gets the phosphor live rule. */
function WeekLedger({ days, nemesisName }: { days: LedgerDay[]; nemesisName: string }) {
  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontVariantNumeric: "tabular-nums",
    fontSize: 12,
  };
  const headCell: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 10,
    letterSpacing: "var(--ls-label)",
    textTransform: "uppercase",
    color: "var(--phosphor-dim)",
  };
  const grid = "minmax(64px, auto) 1fr 1fr 1fr auto";
  return (
    <div
      role="table"
      aria-label="Monday to Friday duel ledger"
      style={{
        border: "1px solid var(--hairline)",
        background: "var(--screen-700)",
        boxShadow: "var(--bevel-raised-shadow), var(--shadow-card)",
      }}
    >
      <div
        role="row"
        style={{
          display: "grid",
          gridTemplateColumns: grid,
          gap: "var(--sp-2)",
          alignItems: "baseline",
          padding: "var(--sp-2) var(--sp-3)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <span role="columnheader" style={headCell}>Day</span>
        <span role="columnheader" style={{ ...headCell, textAlign: "right" }}>You</span>
        <span role="columnheader" style={{ ...headCell, textAlign: "right" }}>{nemesisName}</span>
        <span role="columnheader" style={{ ...headCell, textAlign: "right" }}>Delta</span>
        <span role="columnheader" style={{ ...headCell, width: 28, textAlign: "center" }}>W/L</span>
      </div>
      {days.map((day) => {
        const delta = day.youSteps - day.nemSteps;
        const isFuture = day.kind === "future";
        const isToday = day.kind === "today";
        const mark =
          isFuture ? "—" :
          isToday ? "live" :
          day.outcome === "you" ? "W" :
          day.outcome === "nemesis" ? "L" : "T";
        // §5 red discipline: historical W/L is routine — win = bright green,
        // loss = muted green. Red stays reserved for live urgency/threat.
        const markColor =
          mark === "W" ? "var(--phosphor-hot)" :
          mark === "L" ? "var(--phosphor-dim)" :
          mark === "live" ? "var(--phosphor)" :
          "var(--phosphor-dim)";
        return (
          <div
            key={day.date}
            role="row"
            style={{
              display: "grid",
              gridTemplateColumns: grid,
              gap: "var(--sp-2)",
              alignItems: "baseline",
              padding: "var(--sp-2) var(--sp-3)",
              opacity: isFuture ? 0.45 : 1,
              background: isToday ? "var(--phosphor-08)" : "transparent",
              borderLeft: isToday ? "2px solid var(--phosphor)" : "2px solid transparent",
              borderBottom: "1px solid var(--phosphor-08)",
            }}
          >
            <span
              role="rowheader"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--phosphor)",
              }}
            >
              {day.label.slice(0, 3)}
            </span>
            <span role="cell" style={{ ...mono, textAlign: "right", color: "var(--phosphor)" }}>
              {isFuture ? "·" : day.youSteps.toLocaleString()}
            </span>
            <span role="cell" style={{ ...mono, textAlign: "right", color: "var(--phosphor-dim)" }}>
              {isFuture ? "·" : day.nemSteps.toLocaleString()}
            </span>
            <span
              role="cell"
              style={{
                ...mono,
                textAlign: "right",
                color: isFuture || delta === 0 ? "var(--phosphor-dim)" : delta > 0 ? "var(--phosphor-hot)" : "var(--phosphor-dim)",
              }}
            >
              {isFuture ? "·" : delta === 0 ? "even" : `${delta > 0 ? "▲" : "▼"} ${Math.abs(delta).toLocaleString()}`}
            </span>
            <span
              role="cell"
              aria-label={mark === "W" ? "won" : mark === "L" ? "lost" : mark === "T" ? "tie" : mark === "live" ? "in progress" : "not played"}
              style={{
                ...mono,
                width: 28,
                textAlign: "center",
                textTransform: "uppercase",
                fontSize: mark === "live" ? 9 : 12,
                color: markColor,
              }}
            >
              {mark}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function NemesisPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const seasonWeek = useSeasonWeek(Boolean(user?.group_id));
  const { data, isLoading, error } = useNemesisData(!!user?.group_id);
  const [rerollError, setRerollError] = useState<string | null>(null);

  const reroll = useMutation({
    mutationFn: () => api("/api/nemesis/reroll", { method: "POST" }),
    onSuccess: () => {
      setRerollError(null);
      queryClient.invalidateQueries({ queryKey: ["nemesis", "current"] });
    },
    onError: (e) => {
      setRerollError(
        e instanceof ApiError && e.code === "REROLL_USED"
          ? "You already used your reroll this week."
          : e instanceof ApiError
            ? e.message
            : "Reroll failed — try again.",
      );
    },
  });

  if (!user?.group_id) {
    return (
      <div style={{ padding: "var(--sp-6)" }}>
        <EmptyState
          icon="nemesis"
          title="No group yet"
          body="Join or create a group to get a nemesis."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: "var(--sp-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sp-4)",
        }}
      >
        <Skeleton preset="block" style={{ height: 28, width: 160 }} />
        <Skeleton preset="block" style={{ height: 80 }} />
        <Skeleton preset="block" style={{ height: 260 }} />
        <Skeleton preset="block" style={{ height: 260 }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "var(--sp-6)" }}>
        <EmptyState
          icon="nemesis"
          title="Couldn't load your matchup"
          body="Try syncing your steps first."
        />
      </div>
    );
  }

  if (data.state === "no_matchup" || data.state === "bye") {
    return (
      <div style={{ padding: "var(--sp-6)" }}>
        <EmptyState
          icon="nemesis"
          title={data.state === "bye" ? "Selena's day off" : "Get your nemesis"}
          body={
            data.state === "bye"
              ? "Odd one out this week — you sit out the duel. New pairings Monday."
              : "You need at least one other group member to start a duel. Pairings happen every Monday."
          }
        />
      </div>
    );
  }

  const { matchup, you, nemesis, week, today, weekMax } = data;
  if (!matchup || !you || !nemesis) return null;

  const mySide: "a" | "b" = matchup.player_a === you.user_id ? "a" : "b";
  const youScore = mySide === "a" ? matchup.score_a : matchup.score_b;
  const nemScore = mySide === "a" ? matchup.score_b : matchup.score_a;
  const youWon = matchup.winner_id === you.user_id;
  const resultByDate = new Map(matchup.daily_results.map((r) => [r.date, r]));

  const days = DAY_LABELS.map((label, i) => {
    const date = addDays(week.starts_on, i);
    const result = resultByDate.get(date);
    if (result) {
      const youSteps = mySide === "a" ? result.a_steps : result.b_steps;
      const nemSteps = mySide === "a" ? result.b_steps : result.a_steps;
      const outcome =
        result.winner === "tie" ? ("tie" as const) : result.winner === mySide ? ("you" as const) : ("nemesis" as const);
      return { label, date, youSteps, nemSteps, outcome, kind: "done" as const };
    }
    if (date === today) {
      return {
        label,
        date,
        youSteps: you.steps_today,
        nemSteps: nemesis.steps_today,
        outcome: "progress" as const,
        kind: "today" as const,
      };
    }
    return { label, date, youSteps: 0, nemSteps: 0, outcome: "progress" as const, kind: "future" as const };
  });

  // Today is the hero; once the week's over, the last played day stands in.
  const heroDay =
    days.find((d) => d.kind === "today") ?? [...days].reverse().find((d) => d.kind === "done") ?? null;

  return (
    <div
      style={{
        padding: "var(--space-md) var(--space-lg) var(--space-2xl)",
        maxWidth: 560,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "var(--fs-label)",
            letterSpacing: "var(--ls-label)",
            textTransform: "uppercase",
            color: "var(--phosphor-dim)",
            margin: 0,
          }}
        >
          [ Pacing console ]
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 30,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            color: "var(--phosphor)",
            margin: "2px 0 0",
          }}
        >
          Nemesis
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--phosphor-dim)",
            margin: "var(--sp-1) 0 0",
          }}
        >
          {data.state === "scheduled"
            ? "Rival assignment: Selena studies patterns. This week, so will you."
            : "Five daily rounds, Monday to Friday. Most verified steps wins the day; first to three wins. Participation feeds up to 1% of the group chase — nobody has to lose for the unit to benefit."}
        </p>
        <SundayCountdown style={{ marginTop: "var(--sp-2)" }} />
      </div>

      {data.state === "scheduled" && (
        <Banner
          tone="gold"
          icon="nemesis"
          title="Rival assignment"
          body={`You vs. ${nemesis.display_name}. "You know each other's habits. Let us see who understands them better." — S.C.`}
        />
      )}
      {matchup.status === "complete" && (
        <Banner
          tone="gold"
          icon="crown"
          title={youWon ? "You won the week!" : `${nemesis.display_name} took the week`}
          body={
            youWon
              ? "Crown earned. Rematch pairings drop Monday."
              : "Get your revenge — new pairings drop Monday."
          }
        />
      )}
      {matchup.status === "tiebreak" && (
        <Banner
          tone="red"
          icon="flame"
          title={seasonWeek?.rituals.suddenDeath.headline ?? "Sudden death"}
          body={seasonWeek?.rituals.suddenDeath.body ?? "Today decides the matchup. Most verified steps by midnight wins."}
        />
      )}

      <ScoreBar you={you} nemesis={nemesis} youScore={youScore} nemesisScore={nemScore} />

      {matchup.status !== "complete" && data.state !== "scheduled" && (
        <TodayContextStrip you={you} nemesis={nemesis} />
      )}

      {/* Hero matchup — today's duel as the one big skyline */}
      {heroDay && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "var(--sp-1)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "var(--fs-label)",
                letterSpacing: "var(--ls-label)",
                textTransform: "uppercase",
                color: "var(--phosphor)",
              }}
            >
              [ {heroDay.kind === "today" ? `${heroDay.label} · Today` : heroDay.label} ]
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>
              {heroDay.youSteps.toLocaleString()} · {heroDay.nemSteps.toLocaleString()}
            </span>
          </div>
          <SkyscraperPair
            you={{ label: "You", steps: heroDay.youSteps }}
            nemesis={{ label: nemesis.display_name, steps: heroDay.nemSteps }}
            outcome={heroDay.outcome}
            max={weekMax}
            animate={heroDay.kind === "today"}
          />
        </div>
      )}

      {/* Compact Mon–Fri ledger — every day on one card */}
      <WeekLedger days={days} nemesisName={nemesis.display_name} />

      {data.state !== "scheduled" && matchup.status === "active" && !matchup.rerolled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          <Button
            variant="secondary"
            icon="sync"
            fullWidth
            loading={reroll.isPending}
            onClick={() => reroll.mutate()}
          >
            Reroll nemesis
          </Button>
          {rerollError && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--red)",
                textAlign: "center",
              }}
            >
              {rerollError}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
