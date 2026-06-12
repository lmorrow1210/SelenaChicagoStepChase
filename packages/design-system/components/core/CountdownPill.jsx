import * as React from 'react';
import { Icon } from '../icons/Icon.jsx';

/* ============================================================
   CountdownPill — days/hours until week closes.
   Color shifts as deadline nears: muted → gold (2d) → red (24h).
   ============================================================ */

function tone(hoursLeft) {
  if (hoursLeft <= 24) return { fg: 'var(--red)',  bg: 'var(--red-12)',  bd: 'rgba(204,0,0,0.4)' };
  if (hoursLeft <= 48) return { fg: 'var(--gold)', bg: 'var(--gold-12)', bd: 'var(--gold-20)' };
  return { fg: 'var(--muted)', bg: 'var(--cream-08)', bd: 'var(--hairline)' };
}

function fmt(hoursLeft) {
  if (hoursLeft <= 0) return 'Closed';
  if (hoursLeft < 24) return `${hoursLeft}h left`;
  const d = Math.floor(hoursLeft / 24);
  const h = hoursLeft % 24;
  return h ? `${d}d ${h}h left` : `${d}d left`;
}

export function CountdownPill({ hoursLeft = 72, label = 'Week closes', style }) {
  const t = tone(hoursLeft);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      height: 30, padding: '0 14px', borderRadius: 'var(--r-pill)',
      background: t.bg, border: `1px solid ${t.bd}`, color: t.fg,
      fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
      ...style,
    }}>
      <Icon name="clock" size={15} />
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--muted)', fontSize: 12 }}>{label}</span>
      <span>{fmt(hoursLeft)}</span>
    </span>
  );
}

export default CountdownPill;
