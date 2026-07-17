"use client";

import Toast from "@one-step-ahead/design-system/components/feedback/Toast";
import SelenaMark from "@one-step-ahead/design-system/components/game/SelenaMark";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { api } from "./api";
import { useSession } from "./session";

// In-app notification toasts (M9): unread notifications surface as a stack
// of Toast bars (achievement / social / alert tones), auto-marked
// read after a few seconds on screen or on dismiss.

interface AppNotification {
  id: number;
  kind: "achievement" | "social" | "alert" | "beat";
  message: string;
  read: boolean;
  created_at: string;
}

const AUTO_READ_MS = 5000;
const MAX_VISIBLE = 2;

function BeatToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      role="status"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        alignItems: "center",
        gap: "var(--space-xs)",
        width: "100%",
        background: "var(--paper-grain) var(--tan-200)",
        border: "1px solid var(--case-700)",
        boxShadow: "var(--shadow-elevated)",
        padding: "var(--space-xs) var(--space-sm)",
        textShadow: "none",
        color: "var(--case-900)",
        animation: "sc-toast-in var(--dur-base) var(--ease-out)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          width: 34,
          height: 34,
          background: "var(--case-900)",
          color: "var(--tan-200)",
        }}
      >
        <SelenaMark size={28} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "inline-block",
            transform: "rotate(-4deg)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--red-deep)",
            border: "1.5px solid var(--red-deep)",
            padding: "1px 6px",
          }}
        >
          Intercept
        </div>
        <div
          style={{
            marginTop: "var(--space-2xs)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-body-sm)",
            lineHeight: 1.35,
            color: "var(--case-900)",
          }}
        >
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="File intercept"
        style={{
          alignSelf: "start",
          border: "1px solid var(--case-700)",
          background: "transparent",
          color: "var(--case-900)",
          cursor: "pointer",
          fontFamily: "var(--font-display)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          minWidth: 44,
          minHeight: 32,
        }}
      >
        File
      </button>
    </div>
  );
}

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
          {n.kind === "beat" ? (
            <BeatToast
              message={n.message}
              onClose={() => {
                const t = timers.current.get(n.id);
                if (t) clearTimeout(t);
                timers.current.delete(n.id);
                markRead.mutate([n.id]);
              }}
            />
          ) : (
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
          )}
        </div>
      ))}
    </div>
  );
}
