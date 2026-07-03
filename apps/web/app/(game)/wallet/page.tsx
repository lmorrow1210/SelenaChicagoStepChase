"use client";

import { getCityIcon } from "@one-step-ahead/design-system/components/game/CityBadge";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/session";

/* ============================================================
   INTEL WALLET (M10, addendum §7A) — the personal, season-long
   case-file collection. Every landmark you personally popped
   with a bingo line lives here as an Intel Card; revisited
   landmarks upgrade to a CONFIRMED holo variant.
   ============================================================ */

interface IntelCard {
  id: string;
  variant: "scouted" | "confirmed";
  created_at: string;
  landmark_name: string;
  fun_fact: string | null;
  city_id: number;
  city_name: string;
}

export default function WalletPage() {
  const { user } = useSession();
  const { data, isLoading } = useQuery<{ cards: IntelCard[] }>({
    queryKey: ["wallet"],
    queryFn: () => api("/api/fieldops/wallet"),
    enabled: !!user,
    staleTime: 60_000,
  });

  return (
    <main className="walletPage">
      <header>
        <p className="stamped">[ Operative file ]</p>
        <h1>Intel wallet</h1>
        <p className="walletSub">
          Every landmark you personally decoded, kept for the season. Land the line that pops a
          dossier and the card is yours.
        </p>
      </header>

      {isLoading && <Skeleton preset="landmark" />}

      {!isLoading && (!data || data.cards.length === 0) && (
        <EmptyState
          icon="badge"
          title="No intel cards yet"
          body="Complete a bingo line on the ops board — if your line decodes a landmark, you keep the card."
        />
      )}

      {data && data.cards.length > 0 && (
        <div className="walletGrid">
          {data.cards.map((card) => {
            const CityIcon = getCityIcon(card.city_name);
            const confirmed = card.variant === "confirmed";
            return (
              <article key={card.id} className="intelCard" data-variant={card.variant}>
                <div className="intelArt" aria-hidden="true">
                  {CityIcon ? <CityIcon color="var(--manila)" /> : null}
                </div>
                <div className="intelPlate">
                  <span className="intelCity">{card.city_name}</span>
                  <span className="intelLandmark">{card.landmark_name}</span>
                  {card.fun_fact && <p className="intelFact">{card.fun_fact}</p>}
                  <span className="intelMeta">
                    Scouted by you ·{" "}
                    {new Date(card.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                {confirmed && <span className="confirmedStamp">Confirmed</span>}
              </article>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        .walletPage {
          min-height: 100dvh;
          padding: var(--sp-4);
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
          max-width: 1080px;
          margin: 0 auto;
          width: 100%;
        }
        .walletPage .stamped {
          margin: 0;
          font-family: var(--font-display);
          font-weight: var(--fw-semibold);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--bone-dim);
        }
        .walletPage h1 {
          margin: 2px 0 0;
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: 30px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--bone);
        }
        .walletSub {
          margin: var(--sp-1) 0 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--manila);
          max-width: 52ch;
        }
        .walletGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: var(--sp-3);
        }
        .intelCard {
          position: relative;
          display: flex;
          flex-direction: column;
          border-radius: var(--r-tight);
          background: var(--manila);
          padding: var(--sp-2);
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }
        /* CONFIRMED holo variant — shimmer ring, upgraded on revisit */
        .intelCard[data-variant="confirmed"] {
          background:
            linear-gradient(var(--manila), var(--manila)) padding-box,
            linear-gradient(120deg, var(--amber), var(--vector), var(--amber-hot), var(--amber)) border-box;
          border: 2px solid transparent;
          box-shadow: var(--glow-live);
        }
        .intelArt {
          display: grid;
          place-items: center;
          min-height: 110px;
          border-radius: 4px;
          background: radial-gradient(circle at 50% 32%, var(--ink-600) 0%, var(--ink-800) 72%, var(--ink-900) 100%);
          padding: var(--sp-3);
        }
        .intelArt > :global(svg) {
          width: 62%;
          height: 62%;
          max-width: 110px;
          filter: drop-shadow(0 0 8px rgba(255, 176, 32, 0.3));
        }
        .intelPlate {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: var(--sp-2) var(--sp-1) var(--sp-1);
        }
        .intelCity {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--stamp-red);
        }
        .intelLandmark {
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: 17px;
          line-height: 1.1;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--ink-900);
        }
        .intelFact {
          margin: 3px 0 0;
          font-family: var(--font-body);
          font-size: 12px;
          line-height: 1.4;
          color: rgba(12, 15, 20, 0.72);
        }
        .intelMeta {
          margin-top: var(--sp-1);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(12, 15, 20, 0.55);
        }
        .confirmedStamp {
          position: absolute;
          top: var(--sp-2);
          right: var(--sp-2);
          transform: rotate(-8deg);
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--stamp-red);
          border: 1.5px solid var(--stamp-red);
          border-radius: 2px;
          padding: 0 5px;
          background: rgba(243, 236, 217, 0.7);
        }
      `}</style>
    </main>
  );
}
