"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { DEMO } from "../demo";
import { useSession } from "../session";
import type { EvidenceBoardData } from "../narrative/EvidenceBoard";
import { FINALE_WEEK_NUMBER } from "./trigger";

/** True once the viewer's group has closed Week 13 (or in the backend-free demo). */
export function isFinaleUnlocked(board: Pick<EvidenceBoardData, "weeks"> | null | undefined): boolean {
  if (DEMO) return true;
  const week = board?.weeks.find((w) => w.weekNumber === FINALE_WEEK_NUMBER);
  return week?.outcome != null;
}

/** Shares the Evidence board query key, so no extra fetch on that screen. */
export function useFinaleAccess(): { loading: boolean; unlocked: boolean } {
  const session = useSession();
  const board = useQuery({
    queryKey: ["evidence"],
    queryFn: () => api<EvidenceBoardData>("/api/evidence"),
    enabled: Boolean(session.user),
  });
  return { loading: session.loading || board.isLoading, unlocked: isFinaleUnlocked(board.data) };
}
