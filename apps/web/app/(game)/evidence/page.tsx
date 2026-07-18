"use client";

import { useQuery } from "@tanstack/react-query";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/session";
import { withBase } from "../../../lib/links";
import { EvidenceBoard, type EvidenceBoardData } from "../../../lib/narrative/EvidenceBoard";

export default function EvidencePage() {
  const session = useSession();
  const board = useQuery({
    queryKey: ["evidence"],
    queryFn: () => api<EvidenceBoardData>("/api/evidence"),
    enabled: Boolean(session.user),
  });

  if (session.loading || board.isLoading) {
    return (
      <main className="evidencePage" aria-busy="true">
        <Skeleton rows={4} />
        <Styles />
      </main>
    );
  }

  if (!session.user) {
    return (
      <main className="evidencePage">
        <EmptyState
          icon="map"
          title="Sign in"
          body="The evidence locker is Bureau-access only."
          action={<a className="evidenceAction" href={withBase("/login")}>Continue</a>}
        />
        <Styles />
      </main>
    );
  }

  if (board.isError || !board.data) {
    return (
      <main className="evidencePage">
        <EmptyState icon="globe" title="Evidence locker unavailable" body="Join a group to open the season file." />
        <Styles />
      </main>
    );
  }

  return (
    <main className="evidencePage">
      <header>
        <p className="kicker">[ Bureau evidence locker ]</p>
        <h1>Season Evidence</h1>
      </header>
      <EvidenceBoard board={board.data} />
      <Styles />
    </main>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      .evidencePage {
        padding: var(--space-md) var(--space-lg) var(--space-2xl);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        max-width: var(--content-max);
        margin: 0 auto;
        width: 100%;
      }
      .evidencePage .kicker {
        margin: 0;
        font-family: var(--font-display);
        font-size: var(--fs-label);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--phosphor-dim);
      }
      .evidencePage h1 {
        margin: var(--sp-1) 0 0;
        font-family: var(--font-display);
        font-size: var(--fs-h2);
        text-transform: uppercase;
        color: var(--phosphor-hot);
      }
      .evidenceAction {
        min-height: var(--touch-min);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--sp-2) var(--sp-4);
        background: var(--phosphor);
        color: var(--case-900);
        font-weight: var(--fw-bold);
      }
      @media (max-width: 767px) {
        .evidencePage {
          padding: var(--space-sm) var(--space-sm) var(--space-xl);
        }
      }
    `}</style>
  );
}
