"use client";

import Avatar from "@selenas-chase/design-system/components/game/Avatar";
import type { ColorwayId } from "@selenas-chase/design-system/components/game/Avatar";
import CityBadge from "@selenas-chase/design-system/components/game/CityBadge";
import LandmarkTile from "@selenas-chase/design-system/components/game/LandmarkTile";
import EmptyState from "@selenas-chase/design-system/components/feedback/EmptyState";
import Skeleton from "@selenas-chase/design-system/components/feedback/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/session";

type LandmarkState = "locked" | "unlocked" | "today";

interface CityPayload {
  city: {
    id: number;
    name: string;
    country: string;
    route_order: number;
    background_image: string | null;
    lat: number;
    lng: number;
  };
  landmarks: {
    id: number;
    day: number;
    name: string;
    fun_fact: string;
    image: string | null;
    state: LandmarkState;
  }[];
  groupWorkout: {
    total_members: number;
    worked_out_today: number;
    members: {
      user_id: string;
      display_name: string;
      avatar_skin: number;
      avatar_hair: number;
      avatar_colorway: number;
      worked_out: boolean;
    }[];
  };
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

function useCityData(enabled: boolean) {
  return useQuery({
    queryKey: ["city", "current"],
    queryFn: () => api<CityPayload>("/api/cities/current"),
    enabled,
  });
}

function colorwayFrom(value: number): ColorwayId {
  return COLORWAYS[Math.max(0, value - 1) % COLORWAYS.length];
}

function LoadingCity() {
  return (
    <main className="cityPage" aria-busy="true">
      <Skeleton preset="block" style={{ height: "var(--sp-9)", borderRadius: "var(--r-card)" }} />
      <Skeleton preset="landmark" />
      <CityStyles />
    </main>
  );
}

export default function CityPage() {
  const session = useSession();
  const city = useCityData(Boolean(session.user));

  if (session.loading) return <LoadingCity />;

  if (!session.user) {
    return (
      <main className="cityPage">
        <EmptyState
          icon="city"
          title="Sign in"
          body="The city dossier is waiting."
          action={
            <a className="cityAction" href="/login">
              Continue
            </a>
          }
        />
        <CityStyles />
      </main>
    );
  }

  if (city.isLoading) return <LoadingCity />;

  if (city.isError || !city.data) {
    return (
      <main className="cityPage">
        <EmptyState
          icon="globe"
          title={session.group ? "City unavailable" : "No group yet"}
          body={session.group ? "Try again in a minute." : "Create or join a team to unlock city landmarks."}
          action={
            session.group ? undefined : (
              <a className="cityAction" href="/onboarding">
                Start
              </a>
            )
          }
        />
        <CityStyles />
      </main>
    );
  }

  const data = city.data;
  const unlockedCount = data.landmarks.filter((landmark) => landmark.state === "unlocked").length;

  return (
    <main className="cityPage">
      <section className="cityHero">
        <CityBadge name={data.city.name} quality="gold" size={80} />
        <div className="cityHeroText">
          <p className="eyebrow">City {data.city.route_order}</p>
          <h1>{data.city.name}</h1>
          <p>{data.city.country}</p>
        </div>
        <div className="landmarkCount">
          <span>Landmarks</span>
          <strong>
            {unlockedCount}/{data.landmarks.length}
          </strong>
        </div>
      </section>

      <section className="workoutPanel" aria-label="Group workout status">
        <div>
          <p className="eyebrow">Hot pursuit</p>
          <h2>
            {data.groupWorkout.worked_out_today}/{data.groupWorkout.total_members} today
          </h2>
        </div>
        <div className="avatarRow">
          {data.groupWorkout.members.map((member) => (
            <div className="avatarStatus" data-done={member.worked_out ? "true" : "false"} key={member.user_id}>
              <Avatar size={40} colorway={colorwayFrom(member.avatar_colorway)} ring={member.worked_out} />
              <span>{member.display_name}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Landmarks">
        <div className="sectionHeader">
          <h2>Landmarks</h2>
        </div>
        <div className="landmarkGrid">
          {data.landmarks.map((landmark, index) => (
            <LandmarkTile
              key={landmark.id}
              name={landmark.name}
              fact={landmark.fun_fact}
              state={landmark.state}
              color={LANDMARK_COLORS[index % LANDMARK_COLORS.length]}
              icon={landmark.day % 2 === 0 ? "star" : "city"}
            />
          ))}
        </div>
      </section>

      <CityStyles />
    </main>
  );
}

function CityStyles() {
  return (
    <style jsx global>{`
      .cityPage {
        min-height: 100dvh;
        padding: var(--sp-5);
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
      }

      .cityHero,
      .workoutPanel {
        border: 1px solid var(--hairline);
        border-radius: var(--r-card);
        background: var(--card);
        box-shadow: var(--shadow-card);
      }

      .cityHero {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: var(--sp-4);
        align-items: center;
        padding: var(--sp-5);
      }

      .cityHeroText {
        min-width: var(--sp-0);
      }

      .eyebrow,
      .landmarkCount span,
      .avatarStatus span {
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

      .cityHeroText p:last-child {
        margin: var(--sp-1) var(--sp-0) var(--sp-0);
        color: var(--muted);
      }

      .landmarkCount {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
        text-align: right;
      }

      .landmarkCount strong {
        font-family: var(--font-mono);
        font-size: var(--fs-data);
        line-height: var(--lh-data);
        color: var(--gold);
      }

      .workoutPanel {
        display: flex;
        justify-content: space-between;
        gap: var(--sp-4);
        padding: var(--sp-4);
      }

      .avatarRow {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-3);
        justify-content: flex-end;
      }

      .avatarStatus {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sp-1);
      }

      /* Dim only the avatar for not-yet-worked-out members; the name stays
         at full contrast (M9 a11y). */
      .avatarStatus[data-done="false"] > :first-child {
        opacity: 0.58;
      }

      .avatarStatus span {
        max-width: var(--sp-9);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: var(--ls-body);
        text-transform: none;
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

      .cityAction {
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
        .cityPage {
          padding: var(--sp-4);
        }

        .cityHero,
        .workoutPanel {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        h1 {
          font-size: var(--fs-h1);
          line-height: var(--lh-heading);
        }

        .landmarkCount {
          text-align: left;
        }

        .avatarRow {
          justify-content: flex-start;
        }
      }
    `}</style>
  );
}
