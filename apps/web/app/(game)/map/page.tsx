"use client";

import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import type { ColorwayId } from "@one-step-ahead/design-system/components/game/Avatar";
import MapPin from "@one-step-ahead/design-system/components/game/MapPin";
import ProgressStrip from "@one-step-ahead/design-system/components/game/ProgressStrip";
import { getCityIcon } from "@one-step-ahead/design-system/components/game/CityBadge";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { withBase } from "../../../lib/links";
import { useSession } from "../../../lib/session";
import { PredictionSection } from "./PredictionSection";

type MapState = "in_progress" | "arrival" | "closing_soon" | "no_group";

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
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

function formatCountdown(value: string | null): string {
  if (!value) return "Not scheduled";
  const ms = new Date(value).getTime() - Date.now();
  if (ms <= 0) return "Arriving now";
  const totalHours = Math.ceil(ms / (60 * 60 * 1000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
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
   on an ink field inside a manila file frame, with a day/time stamp. */
function CityPostcard({ city, stamp }: { city: string; stamp: string }) {
  const CityIcon = getCityIcon(city);
  return (
    <figure className="postcard" aria-label={`${city} — last confirmed sighting`}>
      <div className="postcardArt" aria-hidden="true">
        {CityIcon ? <CityIcon color="var(--manila)" /> : null}
        <span className="postcardRim" />
      </div>
      <figcaption className="postcardPlate">
        <span className="postcardCity">{city}</span>
        <span className="postcardStamp">{stamp}</span>
      </figcaption>
      <span className="postcardCorner" aria-hidden="true" />
      <span className="postcardMark" aria-hidden="true">Last confirmed sighting</span>
    </figure>
  );
}

export default function MapPage() {
  const session = useSession();
  const map = useMapData(Boolean(session.user));

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

  return (
    <main className="mapPage">
      {data.state === "arrival" && <ArrivalCelebration city={data.nextCity?.name ?? data.city?.name ?? "the next city"} />}

      {/* ── Tracking Vector Terminal — two-pane console (§9A) ── */}
      <section className="console" aria-label="Tracking vector terminal">
        {/* Left pane: intercepted city postcard */}
        <CityPostcard city={data.city?.name ?? "Unknown"} stamp={fileStamp()} />

        {/* Right pane: intel readout */}
        <div className="intel">
          <div className="intelHeader">
            <p className="stamped">[ Selena was last seen in ]</p>
            <h1>{data.city?.name ?? "Unknown"}</h1>
            <p className="intelSub">
              Already moving toward {data.nextCity?.name ?? "the finish"}.
            </p>
          </div>

          {/* Hero gap stat — signal-red odometer (the one red on this screen) */}
          <div className="gapWell" role="status">
            <span className="stamped">Selena is</span>
            <span className="gapNumber">{formatNumber(data.selenaLeadSteps)}</span>
            <span className="stamped">steps ahead</span>
          </div>

          <div className="intelRow">
            <div className="telemetry">
              <span className="stamped">Group steps</span>
              <span className="telemetryNumber">{formatNumber(groupSteps)}</span>
            </div>
            <div className="countdown">
              <span className="stamped">She moves in</span>
              <span className="countdownNumber">{formatCountdown(data.countdown)}</span>
            </div>
          </div>

          <p className="syncCaption">Last sync {lastSyncedLabel(data.lastSyncedAt)}</p>
        </div>
      </section>

      {/* ── Route — dashed intel trail with city pins ── */}
      <section className="routeSection" aria-label="Route cities">
        <p className="stamped routeLabel">[ Bureau vector active ]</p>
        <div className="pinRoute">
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
      </section>

      <ProgressStrip
        from={data.city?.name ?? "Start"}
        to={data.nextCity?.name ?? "Finish"}
        players={progressPlayers}
        state={progressPlayers.length ? (progressPlayers.some((player) => player.pct >= 100) ? "end" : "default") : "empty"}
      />

      <PredictionSection />

      <section className="leaderboard" aria-label="Leaderboard">
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
                  ring={isLeader ? "var(--amber-hot)" : undefined}
                />
                <span className="name">{player.display_name}</span>
                <span className="steps">{formatNumber(player.steps)}</span>
                <span className={player.deltaVsLastWeek >= 0 ? "delta positive" : "delta"}>
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

/* Arrival — she slipped out as the team closed in. Amber celebration with
   one red Selena accent (her escape). */
const CONFETTI_COLORS = ["var(--amber)", "var(--amber-hot)", "var(--bone)", "var(--vector)"];

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
          border: 1px solid var(--amber);
          border-radius: var(--r-card);
          background: var(--amber-12);
          box-shadow: var(--glow-live);
          padding: var(--sp-4);
        }
        .arrivalBanner h2 {
          margin: 0;
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h2);
          text-transform: uppercase;
          color: var(--amber);
        }
        .arrivalSub {
          margin: var(--sp-1) 0 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--bone);
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
          border-radius: 2px;
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
        min-height: 100dvh;
        padding: var(--sp-4);
        display: flex;
        flex-direction: column;
        gap: var(--sp-4);
        max-width: 1080px;
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
        color: var(--bone-dim);
      }

      /* ── Two-pane console ── */
      .console {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--sp-4);
        padding: var(--sp-4);
        border-radius: var(--r-card);
        border: 1px solid var(--hairline);
        background: var(--ink-700);
        box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
      }
      @media (min-width: 1024px) {
        .console {
          grid-template-columns: minmax(260px, 2fr) 3fr;
          align-items: stretch;
        }
      }

      /* City postcard — manila file frame around a duotone vignette */
      .postcard {
        position: relative;
        margin: 0;
        display: flex;
        flex-direction: column;
        border-radius: var(--r-tight);
        background: var(--manila);
        padding: var(--sp-2);
        box-shadow: var(--shadow-elevated);
        min-height: 220px;
      }
      .postcardArt {
        position: relative;
        flex: 1;
        min-height: 150px;
        display: grid;
        place-items: center;
        border-radius: 4px;
        background:
          radial-gradient(circle at 50% 32%, var(--ink-600) 0%, var(--ink-800) 72%, var(--ink-900) 100%);
        overflow: hidden;
        padding: var(--sp-4);
      }
      .postcardArt > :global(svg) {
        width: 70%;
        height: 70%;
        max-width: 180px;
        filter: drop-shadow(0 0 10px rgba(255, 176, 32, 0.35));
      }
      .postcardRim {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at 50% 100%, rgba(255, 176, 32, 0.10), transparent 55%);
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
        color: var(--ink-900);
        line-height: 1;
      }
      .postcardStamp {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.1em;
        color: rgba(12, 15, 20, 0.65);
        white-space: nowrap;
      }
      .postcardCorner {
        position: absolute;
        top: 0;
        right: 0;
        width: 0;
        height: 0;
        border-top: 16px solid var(--ink-900);
        border-left: 16px solid transparent;
        border-top-right-radius: var(--r-tight);
      }
      .postcardMark {
        position: absolute;
        top: var(--sp-3);
        left: var(--sp-3);
        transform: rotate(-8deg);
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--stamp-red);
        border: 1.5px solid var(--stamp-red);
        border-radius: 2px;
        padding: 1px 6px;
        opacity: 0.9;
        pointer-events: none;
      }

      /* Intel readout */
      .intel {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        min-width: 0;
      }
      .intelHeader h1 {
        margin: 2px 0 0;
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: clamp(40px, 6vw, 56px);
        line-height: var(--lh-display);
        letter-spacing: var(--ls-display);
        text-transform: uppercase;
        color: var(--bone);
      }
      .intelSub {
        margin: var(--sp-1) 0 0;
        font-family: var(--font-body);
        font-size: var(--fs-body-sm);
        color: var(--manila);
      }

      /* Hero gap stat — red odometer on an inset ink screen */
      .gapWell {
        display: flex;
        align-items: baseline;
        gap: var(--sp-3);
        flex-wrap: wrap;
        padding: var(--sp-3) var(--sp-4);
        border-radius: var(--r-tight);
        background: var(--ink-800);
        box-shadow: var(--screen-inset-shadow);
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
        grid-template-columns: 1fr 1fr;
        gap: var(--sp-3);
      }
      .telemetry,
      .countdown {
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--r-tight);
        background: var(--ink-800);
        box-shadow: var(--screen-inset-shadow);
        min-width: 0;
      }
      .telemetryNumber,
      .countdownNumber {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        font-size: var(--fs-data-sm);
        line-height: 1.1;
        color: var(--amber);
      }

      /* LAST SYNC demoted to a caption (§5) */
      .syncCaption {
        margin: 0;
        font-family: var(--font-body);
        font-size: var(--fs-caption);
        color: var(--bone-dim);
      }

      /* ── Route ── */
      .routeSection {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        padding: var(--sp-4);
        border-radius: var(--r-card);
        border: 1px solid var(--hairline);
        background: var(--ink-700);
        box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
      }
      .routeLabel {
        border-bottom: 1px solid var(--hairline);
        padding-bottom: var(--sp-2);
      }
      .pinRoute {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: var(--sp-3);
        align-items: end;
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
        background: var(--ink-700);
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
        color: var(--bone-dim);
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
        border-bottom: 1px solid rgba(243, 236, 217, 0.07);
      }
      .leaderboardRow:last-child {
        border-bottom: 0;
      }
      .leaderboardRow[data-mine="true"] {
        background: var(--amber-08);
      }
      .rank,
      .steps {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
      }
      .rank {
        color: var(--bone-dim);
      }
      .rank[data-first="true"] {
        color: var(--amber-hot);
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--bone);
        font-weight: var(--fw-medium);
        font-size: var(--fs-body-sm);
      }
      .steps {
        color: var(--amber);
      }
      .delta {
        font-family: var(--font-mono);
        font-size: var(--fs-caption);
        color: var(--bone-dim);
      }
      .delta.positive {
        color: var(--vector);
      }

      .mapAction {
        min-height: var(--touch-min);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--sp-2) var(--sp-4);
        border-radius: var(--r-tight);
        background: var(--amber);
        color: var(--ink-900);
        font-weight: var(--fw-bold);
      }

      @media (max-width: 767px) {
        .mapPage {
          padding: var(--sp-3);
          gap: var(--sp-3);
        }
        .intelHeader h1 {
          font-size: 40px;
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
