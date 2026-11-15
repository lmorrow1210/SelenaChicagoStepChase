"use client";

import { useRouter } from "next/navigation";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import { useSession } from "../../lib/session";
import { withBase } from "../../lib/links";
import { SeasonFinale } from "../../lib/finale/SeasonFinale";
import { useFinaleAccess } from "../../lib/finale/access";
import { avatarChoiceFromUser } from "../../lib/finale/trigger";

/**
 * Standalone replay of the Season One send-off. Reached from the Evidence
 * board; also the direct, backend-free demo URL (/finale).
 */
export default function FinalePage() {
  const session = useSession();
  const access = useFinaleAccess();
  const router = useRouter();

  if (session.loading || access.loading) {
    return (
      <main className="finaleGate" aria-busy="true">
        <Skeleton rows={4} />
        <GateStyles />
      </main>
    );
  }

  if (!session.user) {
    return (
      <main className="finaleGate">
        <EmptyState
          icon="map"
          title="Sign in"
          body="The send-off is for operatives who reached the coast."
          action={<a className="gateAction" href={withBase("/login")}>Continue</a>}
        />
        <GateStyles />
      </main>
    );
  }

  if (!access.unlocked) {
    return (
      <main className="finaleGate">
        <EmptyState
          icon="globe"
          title="Still on the road"
          body="The send-off unlocks when your group closes Week 13 in San Francisco."
          action={<a className="gateAction" href={withBase("/map")}>Back to the Map</a>}
        />
        <GateStyles />
      </main>
    );
  }

  return (
    <SeasonFinale
      variant="page"
      avatar={avatarChoiceFromUser(session.user)}
      onContinue={() => router.push("/map")}
    />
  );
}

function GateStyles() {
  return (
    <style jsx global>{`
      .finaleGate {
        min-height: 100dvh;
        padding: var(--space-md);
        background: var(--screen-base);
        display: grid;
        align-content: center;
      }
      .gateAction {
        min-height: var(--touch-min);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--sp-2) var(--sp-4);
        background: var(--phosphor);
        color: var(--case-900);
        font-weight: var(--fw-bold);
      }
    `}</style>
  );
}
