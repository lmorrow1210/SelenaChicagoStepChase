"use client";

import { useEffect, useState } from "react";
import type { SeasonWeekConfig } from "@one-step-ahead/shared/season-one/seasonOne";

type SeasonModule = typeof import("@one-step-ahead/shared/season-one/seasonOne");

let loaded: SeasonModule | null = null;
let loading: Promise<SeasonModule> | null = null;

function load(): Promise<SeasonModule> {
  loading ??= import("@one-step-ahead/shared/season-one/seasonOne").then((mod) => {
    loaded = mod;
    return mod;
  });
  return loading;
}

/**
 * Resolves a week's config without putting the ~110 KB Season One config in
 * the page's first-load JS. Returns null until the module arrives (the
 * rituals that need it are modal surfaces, so nothing shifts), and the sync
 * value on every later render.
 */
export function useSeasonWeekConfig(weekNumber: number | null | undefined): SeasonWeekConfig | null {
  const [mod, setMod] = useState<SeasonModule | null>(loaded);
  useEffect(() => {
    if (weekNumber == null || mod) return;
    let cancelled = false;
    void load().then((m) => {
      if (!cancelled) setMod(m);
    });
    return () => {
      cancelled = true;
    };
  }, [weekNumber, mod]);
  return weekNumber != null && mod ? mod.getSeasonWeek(weekNumber) ?? null : null;
}
