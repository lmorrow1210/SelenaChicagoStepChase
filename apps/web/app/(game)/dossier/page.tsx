"use client";

import LandmarkCard from "@one-step-ahead/design-system/components/game/LandmarkCard";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/session";

interface DossierCard {
  id: string;
  variant: "scouted" | "confirmed";
  created_at: string;
  landmark_id: number;
  landmark_name: string;
  fun_fact: string | null;
  image: string | null;
  city_id: number;
  city_name: string;
  city_country: string;
}

interface DossierCity {
  id: number;
  name: string;
  country: string;
  landmark_id: number;
  day: number;
  landmark_name: string;
  fun_fact: string | null;
  image: string | null;
}

interface DossierPayload {
  owner: { id: string; display_name: string };
  cards: DossierCard[];
  cities: DossierCity[];
}

function dateLabel(value: string): string {
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

/* The teammate link (?user_id=) is read client-side via useSearchParams so
   the route stays statically exportable for the GitHub Pages demo — the
   `searchParams` page prop would force dynamic rendering. */
function DossierContent() {
  const { user } = useSession();
  const userId = useSearchParams().get("user_id") ?? undefined;
  const path = userId ? `/api/fieldops/dossier?user_id=${encodeURIComponent(userId)}` : "/api/fieldops/dossier";
  const { data, isLoading } = useQuery<DossierPayload>({
    queryKey: ["dossier", userId ?? "me"],
    queryFn: () => api(path),
    enabled: !!user,
    staleTime: 60_000,
  });

  const grouped = new Map<number, { id: number; name: string; country: string; landmarks: DossierCity[] }>();
  for (const landmark of data?.cities ?? []) {
    const city = grouped.get(landmark.id) ?? {
      id: landmark.id,
      name: landmark.name,
      country: landmark.country,
      landmarks: [],
    };
    city.landmarks.push(landmark);
    grouped.set(landmark.id, city);
  }

  const cardsByLandmark = new Map<number, DossierCard[]>();
  for (const card of data?.cards ?? []) {
    cardsByLandmark.set(card.landmark_id, [...(cardsByLandmark.get(card.landmark_id) ?? []), card]);
  }

  const ownerName = data?.owner.display_name ?? "You";

  return (
    <main className="dossierPage">
      <header>
        <p className="stamped">[ Operative file ]</p>
        <h1>The Dossier</h1>
        <p className="dossierSub">
          Every decoded landmark, filed by city. Revisited sightings get the confirmed edge.
        </p>
      </header>

      {isLoading && <Skeleton preset="landmark" />}

      {!isLoading && (!data || data.cards.length === 0) && (
        <EmptyState
          icon="badge"
          title="No dossier cards yet"
          body="Complete a bingo line on the ops board. If your line decodes a landmark, the card files here."
        />
      )}

      {data && data.cards.length > 0 && (
        <div className="dossierGroups">
          {[...grouped.values()].map((city) => (
            <section className="cityGroup" key={city.id} aria-label={`${city.name} dossier cards`}>
              <div className="cityGroupHeader">
                <h2>{city.name}</h2>
                <span className="stamped">{city.country}</span>
              </div>
              <div className="dossierGrid">
                {city.landmarks.map((landmark) => {
                  const cards = cardsByLandmark.get(landmark.landmark_id) ?? [];
                  if (!cards.length) {
                    return (
                      <LandmarkCard
                        key={`locked-${landmark.landmark_id}`}
                        variant="locked"
                        cityName={city.name}
                        landmarkName={landmark.landmark_name}
                      />
                    );
                  }

                  return cards.map((card) => (
                    <LandmarkCard
                      key={card.id}
                      variant="decoded"
                      cityName={card.city_name}
                      landmarkName={card.landmark_name}
                      funFact={card.fun_fact}
                      image={card.image}
                      scoutedBy={ownerName}
                      dateLabel={dateLabel(card.created_at)}
                      confirmed={card.variant === "confirmed"}
                    />
                  ));
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <style jsx global>{`
        .dossierPage {
          padding: var(--space-md) var(--space-lg) var(--space-2xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          max-width: var(--content-max);
          margin: 0 auto;
          width: 100%;
        }
        .dossierPage .stamped {
          margin: 0;
          font-family: var(--font-display);
          font-weight: var(--fw-semibold);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
        .dossierPage h1 {
          margin: var(--space-2xs) 0 0;
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: 30px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--phosphor);
        }
        .dossierSub {
          margin: var(--space-2xs) 0 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--phosphor-dim);
          max-width: 52ch;
        }
        .dossierGroups {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .cityGroup {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .cityGroupHeader {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-sm);
          border-bottom: 1px solid var(--hairline);
          padding-bottom: var(--space-xs);
        }
        .cityGroupHeader h2 {
          margin: 0;
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h3);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--phosphor);
        }
        .dossierGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: var(--space-sm);
          align-items: start;
        }
        @media (max-width: 767px) {
          .dossierPage {
            padding-inline: var(--space-sm);
          }
        }
      `}</style>
    </main>
  );
}

export default function DossierPage() {
  // Next requires a Suspense boundary around useSearchParams for static export.
  return (
    <Suspense fallback={null}>
      <DossierContent />
    </Suspense>
  );
}
