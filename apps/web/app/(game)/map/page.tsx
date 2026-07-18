"use client";

import { useEffect, useState } from "react";
import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import type { ColorwayId } from "@one-step-ahead/design-system/components/game/Avatar";
import MapPin from "@one-step-ahead/design-system/components/game/MapPin";
import ProgressStrip from "@one-step-ahead/design-system/components/game/ProgressStrip";
import { getCityIcon } from "@one-step-ahead/design-system/components/game/CityBadge";
import SelenaMark from "@one-step-ahead/design-system/components/game/SelenaMark";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { DataConfidence, RitualId, WeekPhase, WeeklyOutcome } from "@one-step-ahead/shared";
import { getSeasonWeek } from "@one-step-ahead/shared/season-one/seasonOne";
import type { PrimaryAction } from "@one-step-ahead/shared/season-one/primaryAction";
import type { PrimaryBeat } from "@one-step-ahead/shared/season-one/primaryBeat";
import type { ParticipationThresholdState } from "@one-step-ahead/shared/season-one/specialOperations";
import { api } from "../../../lib/api";
import { withBase } from "../../../lib/links";
import { useSession } from "../../../lib/session";
import { CallingCard } from "../../../lib/CallingCard";
import { SundayCountdown } from "../../../lib/SundayCountdown";
import { MondayBriefing } from "../../../lib/narrative/MondayBriefing";
import { CaseClosedReport } from "../../../lib/narrative/CaseClosedReport";
import {
  CaseClosingState,
  FieldUpdateModal,
  FinalPushAlert,
  SuddenDeathAlert,
} from "../../../lib/narrative/RitualSurfaces";
import {
  ChapterHeader,
  DataConfidenceNotice,
  NarrativeBeatPanel,
  PlatformSweepCard,
  PrimaryActionCard,
  SystemCards,
  TeamActivity,
} from "../../../lib/narrative/ChaseCards";

type MapState = "in_progress" | "arrival" | "closing_soon" | "no_group";

interface SeasonState {
  season: { id: string; title: string; weekNumber: number; totalWeeks: number };
  chapter: { city: string; title: string; complication: string | null; nextCity: string | null };
  phase: WeekPhase;
  dataConfidence: DataConfidence;
  chase: {
    verifiedGroupSteps: number;
    snapshottedTarget: number;
    baseProgress: number;
    fieldOpsBonus: number;
    specialOperationBonus: number;
    nemesisParticipationBonus: number;
    predictionParticipationBonus: number;
    totalNonStepBonus: number;
    finalProgress: number;
    remainingLead: number;
    projectedOutcome: WeeklyOutcome | null;
    finalOutcome: WeeklyOutcome | null;
  };
  primaryAction: PrimaryAction;
  primaryBeat: PrimaryBeat | null;
  platformSweep: ParticipationThresholdState;
  evidencePreview: {
    standardEvidenceId: string;
    standardTitle: string | null;
    unlocked: boolean;
    interceptUnlocked: boolean;
  };
  ritualViews: {
    mondayBriefing: boolean;
    midweekUpdate: boolean;
    finalPush: boolean;
    caseClosed: boolean;
  };
  previousCase: {
    weekId: string;
    weekNumber: number;
    cityName: string;
    chapterTitle: string;
    outcome: WeeklyOutcome;
    baseProgress: number | null;
    finalProgress: number | null;
    remainingLead: number | null;
    bonuses: Record<string, number> | null;
    groupTotalSteps: number | null;
    groupTargetSteps: number;
    dataConfidence: string;
    finalizedAt: string;
    viewed: boolean;
  } | null;
  sync: {
    lastUpdatedAt: string | null;
    incompletePlayerCount: number;
    stalePlayerCount: number;
  };
}

interface City {
  id: number;
  name: string;
  country: string;
  route_order: number;
  lat: number;
  lng: number;
}

interface Week {
  id: string;
  starts_on: string;
  ends_on: string;
  group_target_steps: number;
  status: "active" | "closed";
}

interface ProgressMember {
  user_id: string;
  display_name: string;
  avatar_skin: number;
  avatar_hair: number;
  avatar_colorway: number;
  steps: number;
  target: number;
  pct: number;
}

interface LeaderboardMember extends Omit<ProgressMember, "target" | "pct"> {
  rank: number;
  deltaVsLastWeek: number;
}

interface MapPayload {
  week: Week | null;
  city: City | null;
  nextCity: City | null;
  selenaLeadSteps: number;
  route: { city_id: number; name: string; visited: boolean }[];
  progressStrip: ProgressMember[];
  leaderboard: LeaderboardMember[];
  countdown: string | null;
  lastSyncedAt: string | null;
  seasonState: SeasonState | null;
  state: MapState;
}

const COLORWAYS: ColorwayId[] = ["chicago", "midnight", "emerald", "crimson", "desert", "violet"];
const numberFormat = new Intl.NumberFormat("en-US");

function useMapData(enabled: boolean) {
  return useQuery({
    queryKey: ["map", "current"],
    queryFn: () => api<MapPayload>("/api/weeks/current"),
    enabled,
  });
}

function colorwayFrom(value: number): ColorwayId {
  return COLORWAYS[Math.max(0, value - 1) % COLORWAYS.length];
}

function formatNumber(value: number): string {
  return numberFormat.format(value);
}

function formatDelta(value: number): string {
  if (value === 0) return "even";
  return `${value > 0 ? "▲" : "▼"} ${formatNumber(Math.abs(value))}`;
}

/** End a sentence without doubling a trailing period ("Washington, D.C.."). */
function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function lastSyncedLabel(value: string | null): string {
  if (!value) return "not synced yet";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Case-file day/time stamp, e.g. "THURSDAY, 12 P.M." */
function fileStamp(): string {
  const now = new Date();
  const day = now.toLocaleDateString([], { weekday: "long" });
  let h = now.getHours();
  const suffix = h >= 12 ? "P.M." : "A.M.";
  h = h % 12 || 12;
  return `${day}, ${h} ${suffix}`.toUpperCase();
}

function LoadingMap() {
  return (
    <main className="mapPage" aria-busy="true">
      <Skeleton preset="block" style={{ height: "var(--sp-9)", borderRadius: "var(--r-card)" }} />
      <Skeleton rows={4} />
      <MapStyles />
    </main>
  );
}

/* City postcard — the intercepted intel vignette (§7/§8): duotone landmark
   on a case-brown field inside a tan printout frame, with a day/time stamp. */
function CityPostcard({ city, stamp }: { city: string; stamp: string }) {
  const CityIcon = getCityIcon(city);
  return (
    <figure className="postcard" aria-label={`${city} — last confirmed sighting`}>
      <div className="postcardArt" aria-hidden="true">
        {CityIcon ? <CityIcon color="var(--tan-200)" /> : null}
        <span className="postcardRim" />
      </div>
      <figcaption className="postcardPlate">
        <span className="postcardCity">{city}</span>
        <span className="postcardStamp">{stamp}</span>
      </figcaption>
      <span className="postcardCorner" aria-hidden="true" />
    </figure>
  );
}

export default function MapPage() {
  const session = useSession();
  const map = useMapData(Boolean(session.user));
  const queryClient = useQueryClient();

  // Compact team activity: the three most recent notifications, not a feed.
  const notifications = useQuery({
    queryKey: ["map", "activity"],
    queryFn: () => api<{ notifications: { id: number; message: string }[] }>("/api/notifications"),
    enabled: Boolean(session.user),
  });

  const seasonState = map.data?.seasonState ?? null;
  const weekId = map.data?.week?.id ?? null;

  // Ritual overlays. The briefing auto-opens until viewed and stays
  // reopenable; the case report auto-opens for an unviewed finalized case.
  const [briefingOpen, setBriefingOpen] = useState<boolean | null>(null);
  const [midweekOpen, setMidweekOpen] = useState<boolean | null>(null);
  const [caseReportOpen, setCaseReportOpen] = useState<boolean | null>(null);

  useEffect(() => {
    if (!seasonState) return;
    if (briefingOpen === null && seasonState.phase === "briefing" && !seasonState.ritualViews.mondayBriefing) {
      setBriefingOpen(true);
    }
    if (midweekOpen === null && seasonState.phase === "midweek_update" && !seasonState.ritualViews.midweekUpdate) {
      setMidweekOpen(true);
    }
    if (
      caseReportOpen === null
      && seasonState.previousCase
      && !seasonState.previousCase.viewed
      && seasonState.ritualViews.mondayBriefing
    ) {
      setCaseReportOpen(true);
    }
  }, [seasonState, briefingOpen, midweekOpen, caseReportOpen]);

  // The Final Push surface is a persistent banner — record its first
  // showing so the phase service knows the ritual reached the player.
  useEffect(() => {
    if (seasonState?.phase === "final_push" && !seasonState.ritualViews.finalPush && weekId) {
      void recordRitual(weekId, "final_push");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonState?.phase, weekId]);

  async function recordRitual(targetWeekId: string, ritualId: RitualId) {
    try {
      await api("/api/rituals/view", {
        method: "POST",
        body: JSON.stringify({ week_id: targetWeekId, ritual_id: ritualId }),
      });
      await queryClient.invalidateQueries({ queryKey: ["map", "current"] });
    } catch {
      // A failed view write must never block the dismissal itself.
    }
  }

  if (session.loading) return <LoadingMap />;

  if (!session.user) {
    return (
      <main className="mapPage">
        <EmptyState
          icon="map"
          title="Sign in"
          body="Selena is already moving."
          action={
            <a className="mapAction" href={withBase("/login")}>
              Continue
            </a>
          }
        />
        <MapStyles />
      </main>
    );
  }

  if (map.isLoading) return <LoadingMap />;

  if (map.isError || !map.data) {
    return (
      <main className="mapPage">
        <EmptyState icon="sync" title="Map unavailable" body="Try again in a minute." />
        <MapStyles />
      </main>
    );
  }

  const data = map.data;

  if (data.state === "no_group") {
    return (
      <main className="mapPage">
        <EmptyState
          icon="globe"
          title="No group yet"
          body="Create or join a team to start the hunt."
          action={
            <a className="mapAction" href={withBase("/onboarding")}>
              Start
            </a>
          }
        />
        <MapStyles />
      </main>
    );
  }

  const leaderId = data.leaderboard[0]?.user_id;
  const groupSteps = data.leaderboard.reduce((sum, player) => sum + player.steps, 0);
  const progressPlayers = data.progressStrip.map((player) => ({
    id: player.user_id,
    name: player.display_name,
    pct: player.pct,
    colorway: colorwayFrom(player.avatar_colorway),
    leader: player.user_id === leaderId,
  }));

  const season = data.seasonState;
  const weekConfig = season ? getSeasonWeek(season.season.weekNumber) ?? null : null;
  const previousCaseConfig = season?.previousCase
    ? getSeasonWeek(season.previousCase.weekNumber) ?? null
    : null;
  const groupName = session.group?.name ?? "unit";
  const activityEvents = (notifications.data?.notifications ?? [])
    .slice(0, 3)
    .map((entry) => entry.message);
  const progressPercent = season ? Math.round(season.chase.finalProgress * 1000) / 10 : null;
  const fieldOpsBonusRemaining = season ? Math.max(0, 0.05 - season.chase.fieldOpsBonus) : 0;
  const sweepBonusRemaining = season
    ? Math.max(0, season.platformSweep.maxBonus - season.platformSweep.earnedBonus)
    : 0;
  const daysRemaining = data.week
    ? Math.max(0, Math.ceil((Date.parse(`${data.week.ends_on}T23:59:00Z`) - Date.now()) / 86_400_000))
    : 0;

  return (
    <main className="mapPage">
      {/* ── Ritual overlays ── */}
      {weekConfig && season && briefingOpen && data.week && (
        <MondayBriefing
          weekConfig={weekConfig}
          startingLead={season.chase.snapshottedTarget}
          onDismiss={() => {
            setBriefingOpen(false);
            void recordRitual(data.week!.id, "monday_briefing");
          }}
        />
      )}
      {weekConfig && season && midweekOpen && data.week && (
        <FieldUpdateModal
          weekConfig={weekConfig}
          dataConfidence={season.dataConfidence}
          projectedOutcome={season.chase.projectedOutcome}
          remainingLead={season.chase.remainingLead}
          daysRemaining={daysRemaining}
          fieldOpsBonusRemaining={fieldOpsBonusRemaining}
          specialOperationBonusRemaining={sweepBonusRemaining}
          firstLineComplete={season.chase.fieldOpsBonus > 0}
          groupName={groupName}
          gapClosedPercent={season.chase.finalProgress}
          onDismiss={() => {
            setMidweekOpen(false);
            void recordRitual(data.week!.id, "midweek_update");
          }}
        />
      )}
      {previousCaseConfig && season?.previousCase && caseReportOpen && (
        <CaseClosedReport
          weekConfig={previousCaseConfig}
          data={{
            outcome: season.previousCase.outcome,
            groupName,
            groupTotalSteps: season.previousCase.groupTotalSteps,
            groupTargetSteps: season.previousCase.groupTargetSteps,
            finalProgress: season.previousCase.finalProgress,
            bonuses: season.previousCase.bonuses,
            interceptUnlocked: season.previousCase.outcome === "interception",
            dataConfidence: season.previousCase.dataConfidence,
          }}
          onDismiss={() => {
            setCaseReportOpen(false);
            void recordRitual(season.previousCase!.weekId, "case_closed");
          }}
        />
      )}

      {data.state === "arrival" && <ArrivalCelebration city={data.nextCity?.name ?? data.city?.name ?? "the next city"} />}

      {/* Sunday reset calling card — legacy surface, superseded by the
          Monday Briefing whenever Season One state is live. */}
      {!season && data.week && data.city && (
        <CallingCard weekId={data.week.id} weekStartsOn={data.week.starts_on} lastSeen={data.city.name} />
      )}

      {/* ── Story-first chase hierarchy (Season One) ── */}
      {season && (
        <ChapterHeader
          weekNumber={season.season.weekNumber}
          totalWeeks={season.season.totalWeeks}
          cityName={season.chapter.city}
          chapterTitle={season.chapter.title}
          complication={season.chapter.complication}
          onReviewBriefing={weekConfig ? () => setBriefingOpen(true) : undefined}
        />
      )}
      {season && (
        <DataConfidenceNotice
          dataConfidence={season.dataConfidence}
          incompletePlayerCount={season.sync.incompletePlayerCount}
        />
      )}
      {season?.phase === "case_closing" && weekConfig && (
        <CaseClosingState
          weekConfig={weekConfig}
          trackerWarning={
            season.sync.incompletePlayerCount > 0
              ? `${season.sync.incompletePlayerCount} tracker${season.sync.incompletePlayerCount === 1 ? " has" : "s have"} not reported. Final results may change after synchronization.`
              : null
          }
        />
      )}
      {season?.phase === "sudden_death" && weekConfig && <SuddenDeathAlert weekConfig={weekConfig} />}
      {season?.phase === "final_push" && weekConfig && (
        <FinalPushAlert
          weekConfig={weekConfig}
          dataConfidence={season.dataConfidence}
          projectedOutcome={season.chase.projectedOutcome}
          remainingLead={season.chase.remainingLead}
          fieldOpsBonusRemaining={fieldOpsBonusRemaining}
          specialOperationBonusRemaining={sweepBonusRemaining}
        />
      )}

      {/* ── Tracking Vector Terminal — two-pane console (§9A) ── */}
      <section className="console sc-corners" aria-label="Tracking vector terminal">
        {/* Left pane: intercepted city postcard */}
        <CityPostcard city={data.city?.name ?? "Unknown"} stamp={fileStamp()} />

        {/* Right pane: intel readout — the postcard carries the big city name */}
        <div className="intel">
          <div className="intelHeader">
            <h1 className="stamped sightingLine">[ Last confirmed sighting ]</h1>
            <p className="intelSub">
              {sentence(`Already moving toward ${data.nextCity?.name ?? "the finish"}`)}
            </p>
          </div>

          {/* Hero gap stat — signal-red odometer (the one red on this screen) */}
          <div className="gapWell" role="status">
            <span className="gapMark" aria-hidden="true">
              <SelenaMark size={30} />
            </span>
            <span className="stamped">Selena is</span>
            <span className="gapNumber">{formatNumber(data.selenaLeadSteps)}</span>
            <span className="stamped">steps ahead</span>
          </div>

          {/* Marginal impact — make the gap feel closable (§11) */}
          {data.selenaLeadSteps > 3000 && (
            <p className="gapHint">
              A 3,000-step lunch walk closes the gap to{" "}
              <b>{formatNumber(data.selenaLeadSteps - 3000)}</b>.
            </p>
          )}

          {/* Supporting transparency — the percentage stays available but
              never leads the presentation. */}
          {progressPercent != null && (
            <p className="gapHint">
              {progressPercent}% of the weekly pursuit completed
              {season && season.chase.totalNonStepBonus > 0
                ? ` (incl. +${Math.round(season.chase.totalNonStepBonus * 1000) / 10}% from field systems)`
                : ""}
            </p>
          )}

          <div className="intelRow">
            <div className="telemetry">
              <span className="stamped">Group steps</span>
              <span className="telemetryNumber">{formatNumber(groupSteps)}</span>
            </div>
            {/* One reset clock everywhere — Sunday 11:59 PM */}
            {/* stretch to match the group-steps well so the row reads as one rack */}
            <SundayCountdown style={{ alignSelf: "stretch", alignItems: "center" }} />
          </div>

          <p className="syncCaption">Last sync {lastSyncedLabel(data.lastSyncedAt)}</p>
        </div>
      </section>

      {/* ── One deterministic primary action + one primary beat ── */}
      {season && (
        <div className="chaseRow">
          <PrimaryActionCard
            action={season.primaryAction}
            onOpenBriefing={weekConfig ? () => setBriefingOpen(true) : undefined}
            onOpenCaseResult={
              season.previousCase && previousCaseConfig ? () => setCaseReportOpen(true) : undefined
            }
          />
          {season.primaryBeat && season.phase !== "case_closing" && (
            <NarrativeBeatPanel beat={season.primaryBeat} />
          )}
        </div>
      )}

      {/* Platform Sweep — the weekly special operation */}
      {season && weekConfig && season.platformSweep.active && (
        <PlatformSweepCard
          operation={season.platformSweep}
          fiction={weekConfig.rituals.specialOperationFiction}
        />
      )}

      {/* Secondary system cards + evidence preview */}
      {season && (
        <SystemCards
          cards={[
            {
              id: "field_ops",
              title: "Field Ops",
              primary: season.chase.fieldOpsBonus > 0
                ? `+${Math.round(season.chase.fieldOpsBonus * 1000) / 10}% chase bonus earned`
                : "Complete operations to improve the pursuit",
              secondary: weekConfig ? `Complication: ${weekConfig.complication.label}` : undefined,
              href: "/fieldops",
            },
            {
              id: "prediction",
              title: "Prediction",
              primary: "How close will your unit get by Sunday night?",
              secondary: "Sealed until the reveal",
              href: "/prediction",
            },
            {
              id: "nemesis",
              title: "Nemesis",
              primary: "Five daily rounds. Most verified steps wins the day.",
              secondary: season.phase === "sudden_death" ? "SUDDEN DEATH ACTIVE" : undefined,
              href: "/nemesis",
            },
            {
              id: "evidence",
              title: `${season.chapter.city} evidence`,
              primary: season.evidencePreview.unlocked && season.evidencePreview.standardTitle
                ? season.evidencePreview.standardTitle
                : "Complete the case to recover the evidence.",
              secondary: season.evidencePreview.unlocked
                ? season.evidencePreview.interceptUnlocked
                  ? "Intercept clue recovered — view on evidence board"
                  : "View on evidence board"
                : "Sealed until case close",
              href: "/evidence",
            },
          ]}
        />
      )}

      {/* Compact team activity — at most three recent events */}
      {season && <TeamActivity events={activityEvents} />}

      {/* ── Route — dashed intel trail with city pins ── */}
      <section className="routeSection sc-corners" aria-label="Route cities">
        <p className="stamped routeLabel">[ Bureau vector active ]</p>
        <div className="pinRoute">
          {/* Dashed phosphor intel vector behind the pins, pulsing dot at the leading edge */}
          <RouteVector
            count={data.route.length}
            currentIndex={Math.max(0, data.route.findIndex((city) => city.city_id === data.city?.id))}
          />
          {data.route.map((city) => {
            const isCurrent = city.city_id === data.city?.id;
            const isNext = city.city_id === data.nextCity?.id;
            const pinVariant = isCurrent ? "current" : isNext ? "next" : city.visited ? "visited" : "upcoming";
            const pin = (
              <MapPin
                variant={pinVariant}
                label={city.name}
                cityName={city.name}
                selena={isNext}
                size={isCurrent ? "md" : "sm"}
              />
            );
            const isPast = city.visited && !isCurrent && !isNext;
            return (
              <div className="pinSlot" key={city.city_id}>
                {isPast ? (
                  <a
                    className="pinLink"
                    href={withBase(`/city/${city.city_id}`)}
                    aria-label={`${city.name} trophy view`}
                  >
                    {pin}
                  </a>
                ) : (
                  pin
                )}
              </div>
            );
          })}
        </div>
        <div className="routeLegend" aria-label="Route legend">
          <span className="legendItem"><span className="legendSwatch legendCleared" /> Cleared</span>
          <span className="legendItem"><span className="legendSwatch legendCurrent" /> Current</span>
          <span className="legendItem"><span className="legendSwatch legendSelena" /> Selena</span>
          <span className="legendItem"><span className="legendSwatch legendFuture" /> Future</span>
        </div>
      </section>

      <ProgressStrip
        from={data.city?.name ?? "Start"}
        to={data.nextCity?.name ?? "Finish"}
        players={progressPlayers}
        state={progressPlayers.length ? (progressPlayers.some((player) => player.pct >= 100) ? "end" : "default") : "empty"}
      />

      <section className="leaderboard sc-corners" aria-label="Leaderboard">
        <div className="leaderboardHeader">
          <h2>[ Bureau leaderboard ]</h2>
          <span className="stamped">This week</span>
        </div>
        <div className="leaderboardRows">
          {data.leaderboard.map((player) => {
            const isMe = player.user_id === session.user?.id;
            const isLeader = player.user_id === leaderId;
            return (
              <div className="leaderboardRow" data-mine={isMe ? "true" : "false"} key={player.user_id}>
                <span className="rank" data-first={isLeader ? "true" : "false"}>{player.rank}</span>
                <Avatar
                  size={30}
                  colorway={colorwayFrom(player.avatar_colorway)}
                  ring={isLeader ? "var(--phosphor-hot)" : undefined}
                />
                <span className="name">{player.display_name}</span>
                <span className="steps">{formatNumber(player.steps)}</span>
                <span className={player.deltaVsLastWeek > 0 ? "delta positive" : "delta"}>
                  {formatDelta(player.deltaVsLastWeek)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <MapStyles />
    </main>
  );
}

/* Dashed phosphor intel vector drawn behind the route pins. The covered leg is
   bright phosphor; the leg ahead is dimmed. A pulsing dot rides the leading
   edge (the current city). Pin centers sit at (i + 0.5) / count. */
function RouteVector({ count, currentIndex }: { count: number; currentIndex: number }) {
  if (count < 2) return null;
  const at = (i: number) => ((i + 0.5) / count) * 100;
  const lead = at(currentIndex);
  return (
    <svg className="routeVector" aria-hidden="true" viewBox="0 0 100 12" preserveAspectRatio="none">
      <line
        x1={at(0)} y1="6" x2={lead} y2="6"
        stroke="var(--map-route)" strokeWidth="2" strokeDasharray="6 5"
        vectorEffect="non-scaling-stroke"
        style={{ animation: "sc-trail-crawl 1.4s linear infinite" }}
      />
      <line
        x1={lead} y1="6" x2={at(count - 1)} y2="6"
        stroke="var(--phosphor-dim)" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 5"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={lead} cy="6" r="3.5"
        fill="var(--phosphor)"
        style={{ animation: "sc-trail-pulse 1.6s var(--ease-in-out) infinite" }}
      />
    </svg>
  );
}

/* Arrival — she slipped out as the team closed in. Phosphor celebration with
   one red Selena accent (her escape). */
const CONFETTI_COLORS = ["var(--phosphor)", "var(--phosphor-hot)", "var(--phosphor)", "var(--phosphor-hot)"];

function ArrivalCelebration({ city }: { city: string }) {
  const pieces = Array.from({ length: 36 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${(i % 9) * 120}ms`,
    duration: `${1800 + (i % 5) * 350}ms`,
  }));
  return (
    <div className="arrival" role="status" aria-label={`So close — she just left ${city}!`}>
      <div className="arrivalConfetti" aria-hidden="true">
        {pieces.map((p, i) => (
          <span
            key={i}
            style={{
              left: p.left,
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
      <div className="arrivalBanner">
        <p className="stamped">So close</p>
        <h2>She was just here — {city}, searched!</h2>
        <p className="arrivalSub">
          <span className="selenaMark">Selena slipped out as you closed in.</span>{" "}
          The hunt picks up her trail at midnight.
        </p>
      </div>
      <style jsx>{`
        .arrival {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--phosphor);
          border-radius: var(--r-card);
          background: var(--phosphor-12);
          box-shadow: var(--glow-live);
          padding: var(--sp-4);
        }
        .arrivalBanner h2 {
          margin: 0;
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h2);
          text-transform: uppercase;
          color: var(--phosphor);
        }
        .arrivalSub {
          margin: var(--sp-1) 0 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor);
        }
        .selenaMark {
          color: var(--signal-red);
        }
        .arrivalConfetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .arrivalConfetti span {
          position: absolute;
          top: -10px;
          width: 7px;
          height: 7px;
          opacity: 0;
          animation-name: sc-confetti-fall;
          animation-timing-function: var(--ease-in-out);
          animation-iteration-count: infinite;
        }
        @keyframes sc-confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            opacity: 0.4;
            transform: translateY(140px) rotate(300deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .arrivalConfetti {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function MapStyles() {
  return (
    <style jsx global>{`
      .mapPage {
        padding: var(--space-md) var(--space-lg) var(--space-2xl);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        max-width: var(--content-max);
        margin: 0 auto;
        width: 100%;
      }

      /* Stamped label role — [ BUREAU VECTOR ACTIVE ] headers */
      .stamped {
        margin: 0;
        font-family: var(--font-display);
        font-weight: var(--fw-semibold);
        font-size: var(--fs-label);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--phosphor-dim);
      }

      /* Primary action + beat share a responsive row */
      .chaseRow {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-sm);
        align-items: stretch;
      }

      /* ── Two-pane console ── */
      .console {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--sp-4);
        padding: var(--sp-4);
        border-radius: var(--r-card);
        border: 1px solid var(--hairline);
        background: var(--screen-700);
        box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
      }
      @media (min-width: 1024px) {
        .console {
          grid-template-columns: minmax(260px, 2fr) 3fr;
          align-items: stretch;
        }
      }

      /* City postcard — tan printout frame around a duotone vignette */
      .postcard {
        position: relative;
        margin: 0;
        display: flex;
        flex-direction: column;
        border-radius: var(--r-tight);
        background: var(--paper-grain) var(--tan-200);
        padding: var(--sp-2);
        box-shadow: var(--shadow-elevated);
        min-height: 220px;
        text-shadow: none; /* paper printout does not glow */
      }
      .postcardArt {
        position: relative;
        flex: 1;
        min-height: 150px;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at 50% 32%, var(--case-700) 0%, var(--case-800) 72%, var(--case-900) 100%);
        overflow: hidden;
        padding: var(--sp-4);
      }
      .postcardArt > :global(svg) {
        width: 70%;
        height: 70%;
        max-width: 180px;
        filter: drop-shadow(0 0 10px rgba(var(--phosphor-glow), 0.35));
      }
      .postcardRim {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at 50% 100%, rgba(var(--phosphor-glow), 0.10), transparent 55%);
      }
      .postcardPlate {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-1) 0;
      }
      .postcardCity {
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: 22px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--case-900);
        line-height: 1;
      }
      .postcardStamp {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.1em;
        color: var(--case-700);
        white-space: nowrap;
      }
      .postcardCorner {
        position: absolute;
        top: 0;
        right: 0;
        width: 0;
        height: 0;
        border-top: 16px solid var(--case-900);
        border-left: 16px solid transparent;
      }

      /* Intel readout */
      .intel {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        min-width: 0;
      }
      /* The sighting status line is an h1 for semantics only — it stays a
         small stamped label; the postcard carries the big city name. */
      h1.sightingLine {
        font-size: var(--fs-label);
        line-height: var(--lh-body);
      }
      .intelSub {
        margin: var(--sp-1) 0 0;
        font-family: var(--font-body);
        font-size: var(--fs-body-sm);
        color: var(--phosphor-dim);
      }

      /* Hero gap stat — red odometer on an inset CRT screen */
      .gapWell {
        display: flex;
        align-items: baseline;
        gap: var(--sp-3);
        flex-wrap: wrap;
        padding: var(--sp-3) var(--sp-4);
        border-radius: var(--r-tight);
        background: var(--screen-700);
        box-shadow: var(--screen-inset-shadow);
      }
      .gapMark {
        display: grid;
        place-items: center;
        align-self: center;
      }
      .gapNumber {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        font-size: clamp(30px, 4.5vw, 40px);
        line-height: 1;
        color: var(--signal-red);
        text-shadow: 0 0 12px rgba(255, 59, 48, 0.35);
      }

      .intelRow {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: var(--sp-3);
      }
      .telemetry {
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--r-tight);
        background: var(--screen-700);
        box-shadow: var(--screen-inset-shadow);
        min-width: 0;
      }
      .telemetryNumber {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        font-size: var(--fs-data-sm);
        line-height: 1.1;
        color: var(--phosphor);
      }

      .gapHint {
        margin: calc(-1 * var(--sp-2)) 0 0;
        font-family: var(--font-body);
        font-size: var(--fs-body-sm);
        color: var(--phosphor-dim);
      }
      .gapHint b {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        color: var(--phosphor);
        font-weight: 500;
      }

      /* LAST SYNC demoted to a caption (§5) */
      .syncCaption {
        margin: 0;
        font-family: var(--font-body);
        font-size: var(--fs-caption);
        color: var(--phosphor-dim);
      }

      /* ── Route ── */
      .routeSection {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        padding: var(--sp-4);
        border-radius: var(--r-card);
        border: 1px solid var(--hairline);
        background: var(--screen-700);
        box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
      }
      .routeLabel {
        border-bottom: 1px solid var(--hairline);
        padding-bottom: var(--sp-2);
      }
      .pinRoute {
        position: relative;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: var(--sp-3);
        align-items: end;
      }
      .routeVector {
        position: absolute;
        top: 30px; /* rides through the pin heads */
        left: 0;
        width: 100%;
        height: 12px;
        overflow: visible;
        pointer-events: none;
      }
      /* The vector assumes one row of pins; when the grid wraps (narrow
         screens) the line would cut through the wrong row — pins + legend
         carry the story alone there. */
      @media (max-width: 767px) {
        .routeVector {
          display: none;
        }
      }
      .routeLegend {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-2) var(--sp-4);
        border-top: 1px solid var(--hairline);
        padding-top: var(--sp-2);
      }
      .legendItem {
        display: inline-flex;
        align-items: center;
        gap: var(--sp-1);
        font-family: var(--font-display);
        font-weight: var(--fw-semibold);
        font-size: var(--fs-label);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--phosphor-dim);
      }
      .legendSwatch {
        width: 10px;
        height: 10px;
        flex: none;
      }
      .legendCleared {
        background: var(--screen-700);
        border: 1px solid var(--hairline-paper);
      }
      .legendCurrent {
        background: var(--phosphor);
        box-shadow: var(--glow-live);
      }
      .legendSelena {
        background: var(--signal-red);
      }
      .legendFuture {
        background: transparent;
        border: 1.5px dashed var(--hairline-paper);
      }
      .pinSlot {
        min-height: var(--sp-9);
        display: grid;
        place-items: center;
      }
      .pinLink {
        display: grid;
        place-items: center;
        border-radius: var(--r-card);
        transition: transform var(--dur-fast) var(--ease-out);
      }
      .pinLink:hover {
        transform: translateY(calc(-1 * var(--sp-1)));
      }

      /* ── Leaderboard — dense case-file rows ── */
      .leaderboard {
        border: 1px solid var(--hairline);
        border-radius: var(--r-card);
        background: var(--screen-700);
        box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
        overflow: hidden;
      }
      .leaderboardHeader {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--hairline);
      }
      .leaderboardHeader h2 {
        margin: 0;
        font-family: var(--font-display);
        font-weight: var(--fw-semibold);
        font-size: var(--fs-label);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--phosphor-dim);
      }
      .leaderboardRows {
        display: flex;
        flex-direction: column;
      }
      .leaderboardRow {
        display: grid;
        grid-template-columns: var(--sp-6) auto minmax(0, 1fr) auto auto;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-2) var(--sp-4);
        border-bottom: 1px solid rgba(var(--phosphor-glow), 0.07);
      }
      .leaderboardRow:last-child {
        border-bottom: 0;
      }
      .leaderboardRow[data-mine="true"] {
        background: var(--phosphor-08);
        box-shadow: var(--bevel-pressed-shadow);
        border-left: 2px solid var(--phosphor);
      }
      .rank,
      .steps {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
      }
      .rank {
        color: var(--phosphor-dim);
      }
      .rank[data-first="true"] {
        color: var(--phosphor-hot);
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--phosphor);
        font-weight: var(--fw-medium);
        font-size: var(--fs-body-sm);
      }
      .steps {
        color: var(--phosphor);
      }
      .delta {
        font-family: var(--font-mono);
        font-size: var(--fs-caption);
        color: var(--phosphor-dim);
      }
      .delta.positive {
        color: var(--phosphor-hot);
      }

      .mapAction {
        min-height: var(--touch-min);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--r-tight);
        background: var(--phosphor);
        color: var(--case-900);
        font-weight: var(--fw-bold);
      }

      @media (max-width: 767px) {
        .mapPage {
          padding: var(--space-sm) var(--space-sm) var(--space-xl);
          gap: var(--space-sm);
        }
        .intelRow {
          grid-template-columns: 1fr;
        }
        .postcard {
          min-height: 180px;
        }
        .leaderboardRow {
          grid-template-columns: var(--sp-5) auto minmax(0, 1fr);
        }
        .steps,
        .delta {
          grid-column: 3;
        }
      }
    `}</style>
  );
}
