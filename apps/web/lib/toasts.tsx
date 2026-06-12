"use client";

import Toast from "@selenas-chase/design-system/components/feedback/Toast";
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

const AUTO_READ_MS = 8000;
const MAX_VISIBLE = 3;

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

  const unread = (data?.notifications ?? []).filter((n) => !n.read).slice(0, MAX_VISIBLE);

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

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        top: "var(--sp-3)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(100% - 2 * var(--sp-3), 460px)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-2)",
        zIndex: "var(--z-toast)" as unknown as number,
      }}
    >
      {unread.map((n) => (
        <div key={n.id} className="toastSlideIn">
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
      <style>{`
        .toastSlideIn { animation: sc-toast-in var(--dur-base) var(--ease-out) both; }
        @keyframes sc-toast-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .toastSlideIn { animation: none; }
        }
      `}</style>
    </div>
  );
}
