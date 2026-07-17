"use client";

import { useQuery } from "@tanstack/react-query";
import { getSeasonWeek, type SeasonWeekConfig } from "@one-step-ahead/shared/season-one/seasonOne";
import { api } from "../api";

interface CurrentWeekSlice {
  seasonState: { season: { weekNumber: number } } | null;
}

/**
 * The active chapter's Season One config, resolved through the same
 * current-week query the map uses (shared react-query cache key, so
 * navigating between screens costs no extra fetch).
 */
export function useSeasonWeek(enabled: boolean): SeasonWeekConfig | null {
  const query = useQuery({
    queryKey: ["map", "current"],
    queryFn: () => api<CurrentWeekSlice>("/api/weeks/current"),
    enabled,
  });
  const weekNumber = query.data?.seasonState?.season.weekNumber;
  return weekNumber != null ? getSeasonWeek(weekNumber) ?? null : null;
}
