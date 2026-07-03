import * as React from 'react';
import { Icon } from '../icons/Icon.jsx';

/* ============================================================
   BingoTile v3 — "Midnight Dossier" operational matrix tile.
   Cleared = pressed inset + amber fill + stamped ✓ (never red —
   red is Selena's). In-progress = raised with amber edge light.
   Free space = Selena silhouette on amber (the one square she
   gave the Bureau for free).
   Optional `tint`: 'step' | 'routine' | 'biometric' — subtle
   vector-category cast on the idle face.
   ============================================================ */

const TINTS = {
  step:      'rgba(255, 176, 32, 0.05)',   /* amber cast */
  routine:   'rgba(55, 211, 196, 0.05)',   /* vector cast */
  biometric: 'rgba(243, 236, 217, 0.05)',  /* bone cast */
};

export function BingoTile({
  label = '10k steps',
  icon = 'step',
  state = 'incomplete',  // 'incomplete' | 'progress' | 'complete' | 'free'
  highlight = false,     // part of a line one tile from completion
  tint,                  // 'step' | 'routine' | 'biometric'
  style,
}) {
  const free = state === 'free';
  const complete = state === 'complete' || free;
  const progress = state === 'progress';

  const bg =
    free     ? 'var(--amber)' :
    complete ? 'var(--amber-12)' :
    TINTS[tint] || 'var(--ink-700)';

  const boxShadow =
    complete ? 'var(--bevel-pressed-shadow)' :
    'var(--bevel-raised-shadow)';

  const border =
    progress  ? '1px solid var(--amber)' :
    highlight ? '1px solid var(--amber-40)' :
    free      ? '1px solid var(--amber)' :
    '1px solid var(--hairline-paper)';

  const fg =
    free     ? 'var(--ink-900)' :
    complete ? 'var(--amber)'   :
    progress ? 'var(--amber)'   :
    'var(--bone-dim)';

  const textColor =
    free     ? 'var(--ink-900)' :
    complete ? 'var(--manila)'  :
    progress ? 'var(--bone)'    :
    'var(--bone-dim)';

  return (
    <div style={{
      position: 'relative', aspectRatio: '1',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 4, textAlign: 'center',
      padding: 6,
      background: bg,
      border,
      borderRadius: 'var(--r-tight)',
      boxShadow: highlight
        ? `${boxShadow}, var(--glow-live)`
        : boxShadow,
      animation: highlight ? 'sc-pulse-amber 1.6s var(--ease-in-out) infinite' : 'none',
      transition: 'background var(--dur-base) var(--ease-out), box-shadow var(--dur-base)',
      ...style,
    }}>

      {/* Stamped ✓ — cleared corner mark */}
      {complete && !free && (
        <span style={{
          position: 'absolute', top: 3, right: 3,
          display: 'grid', placeItems: 'center',
          width: 16, height: 16,
          borderRadius: 'var(--r-tight)',
          background: 'var(--amber)',
          color: 'var(--ink-900)',
        }}>
          <Icon name="check" size={10} strokeWidth={3.2} />
        </span>
      )}

      {/* Main glyph — free space is Selena's silhouette */}
      <Icon
        name={free ? 'nemesis' : icon}
        size={24}
        strokeWidth={complete ? 2.2 : 1.9}
        color={fg}
      />

      {/* Label */}
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: free ? 700 : 500,
        fontSize: 11,
        lineHeight: 1.25,
        color: textColor,
        textTransform: free ? 'uppercase' : 'none',
        letterSpacing: free ? '0.08em' : 0,
      }}>
        {free ? 'Free' : label}
      </span>
    </div>
  );
}

export default BingoTile;
