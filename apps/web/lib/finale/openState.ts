"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny store: is a full-screen cinematic open? The toast shelf pauses while it
 * is, so beat toasts aren't auto-marked read behind a scene nobody can see
 * them through.
 */
let open = 0;
const listeners = new Set<() => void>();

export function setCinematicOpen(isOpen: boolean): void {
  open = Math.max(0, open + (isOpen ? 1 : -1));
  listeners.forEach((l) => l());
}

export function useCinematicOpen(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => open > 0,
    () => false,
  );
}
