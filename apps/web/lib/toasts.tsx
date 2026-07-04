"use client";

import Toast from "@one-step-ahead/design-system/components/feedback/Toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { api } from "./api";
import { useSession } from "./session";

// In-app notification toasts (M9): unread notifications surface as a stack
// of Toast bars (achievement gold / social blue / alert red), auto-marked
// read after a few seconds on screen or on dismiss.

interface AppNotification {
  id: number;
  kind: "achievement" | "social" | "alert";
  message: string;
  read: boolean;
  created_at: string;
}

const AUTO_READ_MS = 5000;
const MAX_VISIBLE = 2;

export function ToastShelf() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery<{ notifications: AppNotification[] }>({
    queryKey: ["notifications"],
    queryFn: () => api("/api/notifications"),
    enabled: !!user,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (ids: number[]) =>
      api("/api/notifications/read", { method: "POST", body: JSON.stringify({ ids }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = (data?.notifications ?? [])
    .filter((n) => !n.read)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, MAX_VISIBLE);

  // Auto-mark visible toasts as read after they've been seen.
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const live = timers.current;
    for (const n of unread) {
      if (!live.has(n.id)) {
        live.set(
          n.id,
          setTimeout(() => {
            live.delete(n.id);
            markRead.mutate([n.id]);
          }, AUTO_READ_MS),
        );
      }
    }
    return () => {
      for (const t of live.values()) clearTimeout(t);
      live.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread.map((n) => n.id).join(",")]);

  if (!unread.length) return null;

  // Fixed stack above the mobile TabBar. It reserves no layout space.
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "calc(var(--tabbar-height) + var(--safe-bottom) + var(--space-md))",
        right: "var(--space-md)",
        width: "min(calc(100vw - 2 * var(--space-md)), 360px)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
        zIndex: "var(--z-toast)" as unknown as number,
        pointerEvents: "none",
      }}
    >
      {unread.map((n) => (
        <div key={n.id} style={{ pointerEvents: "auto" }}>
          <Toast
            type={n.kind}
            message={n.message}
            onClose={() => {
              const t = timers.current.get(n.id);
              if (t) clearTimeout(t);
              timers.current.delete(n.id);
              markRead.mutate([n.id]);
            }}
          />
        </div>
      ))}
    </div>
  );
}
