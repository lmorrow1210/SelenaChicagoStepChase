"use client";

import Avatar from "@selenas-chase/design-system/components/game/Avatar";
import type { ColorwayId } from "@selenas-chase/design-system/components/game/Avatar";
import MapPin from "@selenas-chase/design-system/components/game/MapPin";
import ProgressStrip from "@selenas-chase/design-system/components/game/ProgressStrip";
import EmptyState from "@selenas-chase/design-system/components/feedback/EmptyState";
import Skeleton from "@selenas-chase/design-system/components/feedback/Skeleton";
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
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

function lastSyncedLabel(value: string | null): string {
  if (!value) return "Not synced yet";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
          body="Create or join a team to start the chase."
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
      <section className="mapHero" aria-label="Weekly route">
        <div className="mapHeroTop">
          <div>
            <p className="eyebrow">Selena was last seen in</p>
            <h1>{data.city?.name ?? "Unknown"}</h1>
            <p className="muted">
              {data.city?.country ?? ""} — and she&apos;s already moving toward{" "}
              {data.nextCity?.name ?? "the finish"}
            </p>
          </div>
          <div className="countdown">{formatCountdown(data.countdown)}</div>
        </div>

        <div className="pinRoute" aria-label="Route cities">
          {data.route.map((city) => {
            const isCurrent = city.city_id === data.city?.id;
            const isNext = city.city_id === data.nextCity?.id;
            const pin = (
              <MapPin
                variant={isCurrent ? "current" : isNext ? "next" : "visited"}
                label={city.name}
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

      <section className="statGrid" aria-label="Week stats">
        <div className="stat">
          <span>Group steps</span>
          <strong>{formatNumber(groupSteps)}</strong>
        </div>
        <div className="stat">
          <span>Steps behind her</span>
          <strong>{formatNumber(data.selenaLeadSteps)}</strong>
        </div>
        <div className="stat">
          <span>Last sync</span>
          <strong>{lastSyncedLabel(data.lastSyncedAt)}</strong>
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
          <h2>Leaderboard</h2>
          <span>This week</span>
        </div>
        <div className="leaderboardRows">
          {data.leaderboard.map((player) => {
            const isMe = player.user_id === session.user?.id;
            const isLeader = player.user_id === leaderId;
            return (
              <div className="leaderboardRow" data-mine={isMe ? "true" : "false"} key={player.user_id}>
                <span className="rank">{player.rank}</span>
                <Avatar
                  size={36}
                  colorway={colorwayFrom(player.avatar_colorway)}
                  ring={isLeader ? "var(--gold)" : undefined}
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

const CONFETTI_COLORS = ["var(--blue)", "var(--gold)", "var(--red)", "var(--cream)"];

/** Arrival is the biggest moment in the app (plan M9): confetti + banner. */
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
        <p className="eyebrow">So close</p>
        <h2>She was just here — {city}, searched!</h2>
        <p className="muted">Selena slipped out as you closed in. The chase picks up her trail at midnight.</p>
      </div>
      <style jsx>{`
        .arrival {
          position: relative;
          overflow: hidden;
          border: 1.5px solid var(--gold);
          border-radius: var(--r-card);
          background: var(--gold-12);
          padding: var(--sp-4);
        }
        .arrivalBanner h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-h2);
          text-transform: uppercase;
          color: var(--gold);
        }
        .arrivalConfetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .arrivalConfetti span {
          position: absolute;
          top: -10px;
          width: 8px;
          height: 8px;
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
        padding: var(--sp-5);
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
      }

      .mapHero {
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
        padding: var(--sp-5);
        border-bottom: 1px solid var(--hairline);
        background:
          radial-gradient(circle at 20% 25%, var(--map-land-green), transparent 18%),
          radial-gradient(circle at 74% 38%, var(--map-land-tan), transparent 20%),
          linear-gradient(135deg, var(--map-ocean), var(--map-ocean-2));
      }

      .mapHeroTop {
        display: flex;
        justify-content: space-between;
        gap: var(--sp-4);
        align-items: flex-start;
      }

      .eyebrow,
      .stat span,
      .leaderboardHeader span,
      .delta {
        margin: var(--sp-0);
        font-family: var(--font-body);
        font-size: var(--fs-label);
        font-weight: var(--fw-medium);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--muted);
      }

      h1,
      h2 {
        margin: var(--sp-0);
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        text-transform: uppercase;
        color: var(--cream);
      }

      h1 {
        font-size: var(--fs-display);
        line-height: var(--lh-display);
      }

      h2 {
        font-size: var(--fs-h3);
        line-height: var(--lh-heading);
      }

      .muted {
        margin: var(--sp-1) var(--sp-0) var(--sp-0);
        color: var(--cream);
        font-family: var(--font-body);
      }

      .countdown {
        flex: none;
        border: 1px solid var(--blue-40);
        border-radius: var(--r-pill);
        padding: var(--sp-2) var(--sp-3);
        background: var(--blue-12);
        color: var(--cream);
        font-family: var(--font-mono);
        font-size: var(--fs-data-sm);
      }

      .pinRoute {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--sp-4);
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

      .statGrid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: var(--sp-3);
      }

      .stat,
      .leaderboard {
        border: 1px solid var(--hairline);
        border-radius: var(--r-card);
        background: var(--card);
        box-shadow: var(--shadow-card);
      }

      .stat {
        padding: var(--sp-4);
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
      }

      .stat strong {
        font-family: var(--font-mono);
        font-size: var(--fs-data);
        line-height: var(--lh-data);
        color: var(--cream);
      }

      .leaderboard {
        overflow: hidden;
      }

      .leaderboardHeader,
      .leaderboardRow {
        display: grid;
        align-items: center;
        gap: var(--sp-3);
      }

      .leaderboardHeader {
        grid-template-columns: 1fr auto;
        padding: var(--sp-4);
        border-bottom: 1px solid var(--hairline);
      }

      .leaderboardRows {
        display: flex;
        flex-direction: column;
      }

      .leaderboardRow {
        grid-template-columns: var(--sp-6) auto minmax(0, 1fr) auto auto;
        padding: var(--sp-3) var(--sp-4);
        border-bottom: 1px solid var(--hairline);
      }

      .leaderboardRow:last-child {
        border-bottom: 0;
      }

      .leaderboardRow[data-mine="true"] {
        background: var(--blue-08);
      }

      .rank,
      .steps {
        font-family: var(--font-mono);
      }

      .rank {
        color: var(--muted);
      }

      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--cream);
        font-weight: var(--fw-medium);
      }

      .steps {
        color: var(--cream);
      }

      .delta.positive {
        color: var(--blue);
      }

      .mapAction {
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
        .mapPage {
          padding: var(--sp-4);
        }

        .mapHeroTop,
        .leaderboardRow {
          align-items: stretch;
        }

        h1 {
          font-size: var(--fs-h1);
          line-height: var(--lh-heading);
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
