import * as React from 'react';
import { Icon } from '../icons/Icon.jsx';

/* ============================================================
   Toast v3 — intercepted transmission strip.
   Types: achievement (phosphor-hot — rewards), social (phosphor — the
   team's own channel), alert (signal-red — Selena/danger only).
   Rendered inside the stacked toast region above the TabBar
   (never over the header). Slides up on entry.
   ============================================================ */

const TYPES = {
  achievement: { accent: 'var(--phosphor)',      icon: 'badge',   tag: 'UNLOCK' },
  social:      { accent: 'var(--phosphor-hot)',     icon: 'nemesis', tag: 'BUREAU' },
  alert:       { accent: 'var(--signal-red)', icon: 'sync',    tag: 'ALERT' },
};

export function Toast({ type = 'social', title, message, icon, onClose, style }) {
  const t = TYPES[type] || TYPES.social;
  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', maxWidth: 460,
        background: 'var(--screen-600)',
        borderRadius: 'var(--r-tight)',
        border: '1px solid var(--hairline-paper)',
        borderLeft: `3px solid ${t.accent}`,
        boxShadow: 'var(--bevel-raised-shadow), var(--shadow-elevated)',
        padding: '9px 12px',
        animation: 'sc-toast-in var(--dur-base) var(--ease-out)',
        ...style,
      }}
    >
      <span style={{
        display: 'grid', placeItems: 'center', width: 28, height: 28, flex: 'none',
        color: t.accent,
      }}>
        <Icon name={icon || t.icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
              color: t.accent, flex: 'none',
            }}>[{t.tag}]</span>
            <span style={{
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13,
              color: 'var(--phosphor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{title}</span>
          </div>
        )}
        {message && (
          <div style={{
            /* Primary phosphor, not dim — the message IS the toast, and dim
               green misses AA once axe blends the tan bevel edge into the
               raised face. */
            fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--phosphor)',
            marginTop: 1, lineHeight: 1.4,
          }}>{message}</div>
        )}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" style={{
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--phosphor-dim)',
          display: 'grid', placeItems: 'center', padding: 4, borderRadius: 'var(--r-tight)',
          minWidth: 32, minHeight: 32, // comfortable thumb target (≥ WCAG 2.5.8 24px)
          flex: 'none',
        }}>
          <Icon name="close" size={15} />
        </button>
      )}
    </div>
  );
}

export default Toast;
