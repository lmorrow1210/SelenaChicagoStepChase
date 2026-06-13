import * as React from 'react';
import { Icon } from '../icons/Icon.jsx';

/* ============================================================
   BingoTile v2 — Vintage game board tile.
   Bevel-raised when active. Bevel-inset (stamped) when complete.
   States: incomplete | progress | complete | free
   ============================================================ */

export function BingoTile({
  label = '10k steps',
  icon = 'step',
  state = 'incomplete',  // 'incomplete' | 'progress' | 'complete' | 'free'
  highlight = false,
  style,
}) {
  const free = state === 'free';
  const complete = state === 'complete' || free;
  const progress = state === 'progress';

  /* Background surface */
  const bg =
    free      ? 'var(--selena-deep)' :
    complete  ? 'var(--tobacco)'     :
    progress  ? 'var(--felt)'        :
    'var(--felt)';

  /* Border (bevel direction) */
  const borderColor =
    complete  ? 'var(--bevel-lo) var(--bevel-hi) var(--bevel-hi) var(--bevel-lo)' :  /* inset — stamped */
    progress  ? 'var(--selena) var(--bevel-lo) var(--bevel-lo) var(--selena)'     :  /* selena raised */
    free      ? 'var(--selena) var(--selena-deep) var(--selena-deep) var(--selena)' :
    highlight ? 'var(--selena) var(--bevel-lo) var(--bevel-lo) var(--selena)'     :
    'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)';              /* default raised */

  /* Icon & text color */
  const fg =
    free     ? 'var(--selena)'    :
    complete ? 'var(--dust)'      :
    progress ? 'var(--selena)'    :
    'var(--dust)';

  const textColor =
    free     ? 'var(--parchment)'  :
    complete ? 'var(--dust)'       :
    progress ? 'var(--parchment)'  :
    'var(--dust)';

  return (
    <div style={{
      position: 'relative', aspectRatio: '1',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 5, textAlign: 'center',
      padding: 8,
      background: bg,
      border: '2px solid',
      borderColor: borderColor,
      animation: highlight ? 'sc-pulse-blue 0.9s var(--ease-in-out) infinite' : 'none',
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base)',
      ...style,
    }}>

      {/* Complete stamp: corner marker */}
      {complete && !free && (
        <span style={{
          position: 'absolute', top: 0, right: 0,
          display: 'grid', placeItems: 'center',
          width: 18, height: 18,
          background: 'var(--selena)',
          color: 'var(--tobacco)',
          borderLeft: '2px solid var(--bevel-lo)',
          borderBottom: '2px solid var(--bevel-lo)',
        }}>
          <Icon name="check" size={11} strokeWidth={3} />
        </span>
      )}

      {/* Main icon */}
      <Icon
        name={free ? 'star' : icon}
        size={26}
        strokeWidth={complete ? 1.5 : 2}
        color={fg}
      />

      {/* Label */}
      <span style={{
        fontFamily: free ? 'var(--font-display)' : 'var(--font-body)',
        fontWeight: free ? undefined : 600,
        fontSize: free ? 9 : 11,
        letterSpacing: free ? '0.04em' : '0.01em',
        lineHeight: 1.2,
        color: textColor,
        textTransform: free ? 'uppercase' : 'none',
      }}>
        {free ? 'FREE' : label}
      </span>
    </div>
  );
}

export default BingoTile;
