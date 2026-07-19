"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Shared scaffolding for ritual overlays (Monday briefing, midweek update,
 * case-closed report): fixed scrim, dialog semantics, initial focus,
 * Escape/backdrop dismissal, reduced-motion-safe entrance. Content scrolls
 * inside the panel so long reports stay usable on phones.
 */
export function RitualOverlay({
  labelledBy,
  onDismiss,
  wide = false,
  children,
}: {
  labelledBy: string;
  onDismiss: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          [
            "a[href]",
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[tabindex]:not([tabindex='-1'])",
          ].join(","),
        ),
      ).filter((element) => {
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      });

      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!focusable.includes(active as HTMLElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
    };
  }, [onDismiss]);

  return (
    <div className="ritualScrim" role="presentation" onClick={onDismiss}>
      <div
        className={wide ? "ritualPanel wide sc-corners" : "ritualPanel sc-corners"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>

      <style jsx>{`
        .ritualScrim {
          position: fixed;
          inset: 0;
          z-index: var(--z-overlay);
          display: grid;
          place-items: center;
          padding: var(--space-md);
          background: color-mix(in srgb, var(--case-900) 78%, transparent);
          overflow-y: auto;
        }
        .ritualPanel {
          width: min(560px, 100%);
          max-height: calc(100dvh - var(--space-xl));
          overflow-y: auto;
          background: var(--card-elevated);
          border: 1px solid var(--hairline);
          box-shadow: var(--shadow-elevated);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
          animation: ritual-in 260ms var(--ease-out);
        }
        .ritualPanel.wide {
          width: min(720px, 100%);
        }
        .ritualPanel:focus {
          outline: 2px solid var(--phosphor);
          outline-offset: -2px;
        }
        @keyframes ritual-in {
          from { opacity: 0; transform: translateY(var(--sp-2)); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ritualPanel { animation: none; }
        }
      `}</style>
    </div>
  );
}

/** Shared typographic bits for ritual surfaces. */
export function RitualLabel({ children }: { children: ReactNode }) {
  return (
    <p className="ritualLabel">
      {children}
      <style jsx>{`
        .ritualLabel {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }
      `}</style>
    </p>
  );
}

/** Selena's line — quoted, red-marked, never shown on unverified data. */
export function SelenaLine({ children }: { children: ReactNode }) {
  return (
    <p className="selenaLine">
      <span aria-hidden="true">— </span>
      {children}
      <style jsx>{`
        .selenaLine {
          margin: 0;
          font-family: var(--font-body);
          font-style: italic;
          font-size: var(--fs-body);
          color: var(--signal-red);
          text-shadow: none;
        }
      `}</style>
    </p>
  );
}
