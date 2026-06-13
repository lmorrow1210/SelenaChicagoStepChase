"use client";

import Avatar from "@selenas-chase/design-system/components/game/Avatar";
import type { ColorwayId } from "@selenas-chase/design-system/components/game/Avatar";
import CityBadge from "@selenas-chase/design-system/components/game/CityBadge";
import LandmarkTile from "@selenas-chase/design-system/components/game/LandmarkTile";
import EmptyState from "@selenas-chase/design-system/components/feedback/EmptyState";
import Skeleton from "@selenas-chase/design-system/components/feedback/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api, ApiError } from "../../../../lib/api";
import { useSession } from "../../../../lib/session";

interface TrophyPayload {
  city: {
    id: number;
    name: string;
    country: string;
    route_order: number;
    background_image: string | null;
    lat: number;
    lng: number;
  };
  week: {
    starts_on: string;
    ends_on: string;
    group_target_steps: number;
    group_total_steps: number | null;
    target_hit: boolean | null;
  };
  landmarks: {
    id: number;
    day: number;
    name: string;
    fun_fact: string;
    image: string | null;
    earned: boolean;
  }[];
  unlocked_count: number;
  champion: {
    user_id: string;
    display_name: string;
    avatar_skin: number;
    avatar_hair: number;
    avatar_colorway: number;
    quality: "bronze" | "silver" | "gold" | null;
  } | null;
}

const COLORWAYS: ColorwayId[] = ["chicago", "midnight", "emerald", "crimson", "desert", "violet"];
const LANDMARK_COLORS = [
  "var(--map-land-warm)",
  "var(--red)",
  "var(--map-land-teal)",
  "var(--map-land-green)",
  "var(--map-land-sage)",
  "var(--gold)",
  "var(--blue)",
];

function colorwayFrom(value: number): ColorwayId {
  return COLORWAYS[Math.max(0, value - 1) % COLORWAYS.length];
}

function formatNumber(value: number | null): string {
  return value == null ? "—" : new Intl.NumberFormat("en-US").format(value);
}

function formatWeekRange(startsOn: string, endsOn: string): string {
  const fmt = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(startsOn)} – ${fmt(endsOn)}`;
}

function LoadingTrophy() {
  return (
    <main className="trophyPage" aria-busy="true">
      <Skeleton preset="block" style={{ height: "var(--sp-9)", borderRadius: "var(--r-card)" }} />
      <Skeleton preset="landmark" />
      <TrophyStyles />
    </main>
  );
}

export default function PastCityPage() {
  const session = useSession();
  const params = useParams<{ cityId: string }>();
  const cityId = params.cityId;

  const trophy = useQuery({
    queryKey: ["city", cityId],
    queryFn: () => api<TrophyPayload>(`/api/cities/${cityId}`),
    enabled: Boolean(session.user) && /^\d+$/.test(cityId ?? ""),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && (error.status === 403 || error.status === 404)) &&
      failureCount < 2,
  });

  if (session.loading || trophy.isLoading) return <LoadingTrophy />;

  if (!session.user) {
    return (
      <main className="trophyPage">
        <EmptyState
          icon="city"
          title="Sign in"
          body="Trophies are for the team."
          action={
            <a className="trophyAction" href="/login">
              Continue
            </a>
          }
        />
        <TrophyStyles />
      </main>
    );
  }

  if (trophy.isError || !trophy.data) {
    const forbidden = trophy.error instanceof ApiError && trophy.error.status === 403;
    return (
      <main className="trophyPage">
        <EmptyState
          icon={forbidden ? "lock" : "globe"}
          title={forbidden ? "Not there yet" : "City unavailable"}
          body={
            forbidden
              ? "Selena hasn't been chased through this city. Keep stepping."
              : "Try again in a minute."
          }
          action={
            <a className="trophyAction" href="/map">
              Back to the map
            </a>
          }
        />
        <TrophyStyles />
      </main>
    );
  }

  const data = trophy.data;

  return (
    <main className="trophyPage">
      <a className="backLink" href="/map">
        ← Map
      </a>

      <section className="trophyHero">
        <CityBadge
          name={data.city.name}
          quality={data.champion?.quality ?? "bronze"}
          size={80}
          locked={false}
        />
        <div className="trophyHeroText">
          <p className="eyebrow">Destination {data.city.route_order} · She got away</p>
          <h1>{data.city.name}</h1>
          <p>
            {data.city.country} · {formatWeekRange(data.week.starts_on, data.week.ends_on)}
          </p>
        </div>
        <div className="trophyTally" data-hit={data.week.target_hit ? "true" : "false"}>
          <span>{data.week.target_hit ? "Target hit" : "Target missed"}</span>
          <strong>{formatNumber(data.week.group_total_steps)}</strong>
          <span>of {formatNumber(data.week.group_target_steps)} steps</span>
        </div>
      </section>

      {data.champion && (
        <section className="championPanel" aria-label="City champion">
          <Avatar size={56} colorway={colorwayFrom(data.champion.avatar_colorway)} ring />
          <div>
            <p className="eyebrow">Lead detective</p>
            <h2>{data.champion.display_name}</h2>
          </div>
          <span className="championQuality" data-quality={data.champion.quality ?? "bronze"}>
            {data.champion.quality ?? "bronze"}
          </span>
        </section>
      )}

      <section aria-label="Places searched">
        <div className="sectionHeader">
          <h2>Places you looked</h2>
          <span className="landmarkTally">
            {data.unlocked_count}/{data.landmarks.length} searched
          </span>
        </div>
        <div className="landmarkGrid">
          {data.landmarks.map((landmark, index) => (
            <div
              className="landmarkSlot"
              data-earned={landmark.earned ? "true" : "false"}
              key={landmark.id}
            >
              <LandmarkTile
                name={landmark.name}
                fact={landmark.fun_fact}
                state="unlocked"
                color={LANDMARK_COLORS[index % LANDMARK_COLORS.length]}
                icon={landmark.day % 2 === 0 ? "star" : "city"}
              />
              {!landmark.earned && <span className="missedTag">Missed</span>}
            </div>
          ))}
        </div>
      </section>

      <TrophyStyles />
    </main>
  );
}

function TrophyStyles() {
  return (
    <style jsx global>{`
      .trophyPage {
        min-height: 100dvh;
        padding: var(--sp-5);
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
      }

      .backLink {
        align-self: flex-start;
        font-family: var(--font-body);
        font-size: var(--fs-label);
        font-weight: var(--fw-medium);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--muted);
      }

      .backLink:hover {
        color: var(--cream);
      }

      .trophyHero,
      .championPanel {
        border: 1px solid var(--hairline);
        border-radius: var(--r-card);
        background: var(--card);
        box-shadow: var(--shadow-card);
      }

      .trophyHero {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: var(--sp-4);
        align-items: center;
        padding: var(--sp-5);
      }

      .trophyHeroText {
        min-width: var(--sp-0);
      }

      .eyebrow,
      .trophyTally span,
      .landmarkTally {
        margin: var(--sp-0);
        font-family: var(--font-body);
        font-size: var(--fs-label);
        font-weight: var(--fw-medium);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--muted);
      }

      .trophyPage h1,
      .trophyPage h2 {
        margin: var(--sp-0);
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        text-transform: uppercase;
        color: var(--cream);
      }

      .trophyPage h1 {
        font-size: var(--fs-display);
        line-height: var(--lh-display);
      }

      .trophyPage h2 {
        font-size: var(--fs-h3);
        line-height: var(--lh-heading);
      }

      .trophyHeroText p:last-child {
        margin: var(--sp-1) var(--sp-0) var(--sp-0);
        color: var(--muted);
      }

      .trophyTally {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
        text-align: right;
      }

      .trophyTally strong {
        font-family: var(--font-mono);
        font-size: var(--fs-data);
        line-height: var(--lh-data);
        color: var(--gold);
      }

      .trophyTally[data-hit="false"] strong {
        color: var(--muted);
      }

      .championPanel {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
        padding: var(--sp-4);
      }

      .championPanel > div {
        flex: 1;
        min-width: var(--sp-0);
      }

      .championQuality {
        padding: var(--sp-1) var(--sp-3);
        border-radius: var(--r-pill);
        font-family: var(--font-body);
        font-size: var(--fs-label);
        font-weight: var(--fw-bold);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--navy);
        background: var(--gold);
      }

      .championQuality[data-quality="silver"] {
        background: var(--muted);
      }

      .championQuality[data-quality="bronze"] {
        background: var(--map-land-warm);
      }

      .sectionHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--sp-3);
      }

      .landmarkGrid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: var(--sp-3);
      }

      .landmarkSlot {
        position: relative;
      }

      .landmarkSlot[data-earned="false"] {
        opacity: 0.55;
      }

      .missedTag {
        position: absolute;
        top: var(--sp-2);
        right: var(--sp-2);
        z-index: var(--z-raised);
        padding: var(--sp-0) var(--sp-2);
        border-radius: var(--r-pill);
        font-family: var(--font-body);
        font-size: var(--fs-label);
        font-weight: var(--fw-bold);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--cream);
        background: color-mix(in srgb, var(--navy) 80%, transparent);
        border: 1px solid var(--hairline);
      }

      .trophyAction {
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
        .trophyPage {
          padding: var(--sp-4);
        }

        .trophyHero {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .trophyPage h1 {
          font-size: var(--fs-h1);
          line-height: var(--lh-heading);
        }

        .trophyTally {
          text-align: left;
        }
      }
    `}</style>
  );
}
