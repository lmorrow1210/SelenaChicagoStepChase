import * as React from 'react';
import { Icon } from '../icons/Icon.jsx';

/* ============================================================
   BingoTile v3 — "Midnight Dossier" operational matrix tile.
   Exactly four visual states:
     available — raised ink face, dim glyph
     complete  — pressed inset + amber tint + stamped ✓
     free      — Selena silhouette on amber (the one she gave)
     gifted    — complete face, teal assist badge (the ONLY teal)
   `progress` renders as available with an amber working edge.
   Never red — red is Selena's.
   ============================================================ */

export function BingoTile({
  label = '10k steps',
  icon = 'step',
  state = 'incomplete',  // 'incomplete' | 'progress' | 'complete' | 'free'
  highlight = false,     // part of a line one tile from completion
  gifted = false,        // assist-covered by a teammate
  style,
}) {
  const free = state === 'free';
  const complete = state === 'complete' || free;
  const progress = state === 'progress';

  // §6: completed tiles are a solid phosphor fill on the screen; free is the
  // brighter phosphor-hot square. Both carry dark case text (no glow). Idle
  // and in-progress tiles are green readouts on the screen face (glow).
  const bg =
    free     ? 'var(--phosphor-hot)' :
    complete ? 'var(--phosphor)' :
    'var(--screen-700)';

  const boxShadow =
    complete ? 'var(--bevel-pressed-shadow)' :
    'var(--bevel-raised-shadow)';

  const border =
    progress  ? '1px solid var(--phosphor)' :
    highlight ? '1px solid var(--phosphor-40)' :
    free      ? '1px solid var(--phosphor-hot)' :
    '1px solid var(--grid-line)';

  const lit = complete || free; // dark text on a bright key — matte
  const fg =
    lit      ? 'var(--case-900)' :
    progress ? 'var(--phosphor)' :
    'var(--phosphor-dim)';

  const textColor = fg;

  return (
    <div style={{
      position: 'relative', aspectRatio: '1',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 3, textAlign: 'center',
      padding: 4,
      background: bg,
      border,
      borderRadius: 'var(--r-tight)',
      boxShadow: highlight
        ? `${boxShadow}, var(--glow-live)`
        : boxShadow,
      color: textColor,
      textShadow: lit ? 'none' : 'var(--text-glow)',
      animation: highlight ? 'sc-pulse-amber 1.6s var(--ease-in-out) infinite' : 'none',
      transition: 'background var(--dur-base) var(--ease-out), box-shadow var(--dur-base)',
      ...style,
    }}>

      {/* Stamped ✓ — cleared corner mark (dark chip on the lit key) */}
      {complete && !free && !gifted && (
        <span style={{
          position: 'absolute', top: 3, right: 3,
          display: 'grid', placeItems: 'center',
          width: 14, height: 14,
          borderRadius: 'var(--r-tight)',
          background: 'var(--case-900)',
          color: 'var(--phosphor-hot)',
        }}>
          <Icon name="check" size={9} strokeWidth={3.2} />
        </span>
      )}

      {/* Assist badge — teammate covered this tile (team movement = phosphor-hot) */}
      {gifted && (
        <span
          title="Covered by a teammate"
          style={{
            position: 'absolute', top: 3, right: 3,
            display: 'grid', placeItems: 'center',
            width: 14, height: 14,
            borderRadius: 'var(--r-tight)',
            background: 'var(--case-900)',
            color: 'var(--phosphor-hot)',
          }}>
          <Icon name="nemesis" size={9} strokeWidth={2.6} />
        </span>
      )}

      {/* Main glyph — free space is Selena's silhouette */}
      <Icon
        name={free ? 'nemesis' : icon}
        size={20}
        strokeWidth={complete ? 2.2 : 1.9}
        color={fg}
      />

      {/* Label */}
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: free ? 700 : 500,
        fontSize: 10,
        lineHeight: 1.2,
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
