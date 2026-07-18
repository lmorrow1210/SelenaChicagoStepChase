import * as React from 'react';
import Avatar from './Avatar.jsx';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   ProgressStrip v3 — "Midnight Dossier" trail tracker.
   A dashed intel flight-path from the last confirmed sighting to
   Selena's next silhouette. The leading edge glows phosphor; Selena
   waits at the far end as a red calling-card node. Team tokens
   sit proportionally along the channel (phosphor-hot = team movement);
   near-overlapping tokens stagger vertically so the pack stays
   legible instead of cramming into one spot.
   ============================================================ */

function CityNode({ name, side, selena, reached }) {
  const red = selena && !reached;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      width: 74, flex: 'none',
    }}>
      <div style={{
        display: 'grid', placeItems: 'center',
        width: 44, height: 44, borderRadius: 'var(--r-full)',
        background: red ? 'var(--signal-red)' : 'var(--screen-600)',
        border: `2px solid ${red ? 'var(--signal-red)' : reached ? 'var(--phosphor)' : 'var(--hairline-paper)'}`,
        boxShadow: red ? 'var(--glow-selena)' : reached ? 'var(--glow-live)' : 'var(--shadow-pin)',
        color: red ? 'var(--screen-base)' : reached ? 'var(--phosphor)' : 'var(--phosphor-dim)',
      }}>
        <Icon name={red ? 'nemesis' : 'city'} size={20} strokeWidth={2.1} />
      </div>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: red ? 'var(--signal-red)' : reached ? 'var(--phosphor)' : 'var(--phosphor)',
        textAlign: 'center', lineHeight: 1.2,
        maxWidth: 74, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{name}</span>
    </div>
  );
}

export function ProgressStrip({
  from = 'Chicago',
  to = 'New York',
  players = [],
  state = 'default',   // 'default' | 'end' | 'empty'
  compact = false,
  style,
}) {
  const avSize = compact ? 24 : 32;
  const maxPct = players.length ? Math.max(0, ...players.map(p => p.pct)) : 0;

  /* Cluster stagger: tokens within 6% of a neighbour get vertical offsets
     so a tight pack reads as a pack, not a single blob. */
  const sorted = [...players]
    .map((p, i) => ({ ...p, _i: i }))
    .sort((a, b) => a.pct - b.pct);
  const offsets = new Map();
  let cluster = [];
  const flush = () => {
    cluster.forEach((p, k) => {
      const mid = (cluster.length - 1) / 2;
      offsets.set(p._i, Math.round((k - mid) * (avSize * 0.55)));
    });
    cluster = [];
  };
  sorted.forEach((p) => {
    if (cluster.length && p.pct - cluster[cluster.length - 1].pct > 6) flush();
    cluster.push(p);
  });
  flush();

  return (
    <div style={{
      background: 'var(--screen-700)',
      borderRadius: 'var(--r-card)',
      border: '1px solid var(--hairline-paper)',
      boxShadow: 'var(--bevel-raised-shadow), var(--shadow-card)',
      padding: compact ? '10px 12px' : '12px 14px 14px',
      display: 'flex', flexDirection: 'column', gap: 8,
      ...style,
    }}>
      {/* Stamped file header */}
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
        color: 'var(--phosphor-dim)', letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        borderBottom: '1px solid var(--hairline-paper)', paddingBottom: 7,
      }}>
        [ Team progress: {from} → {to} ]
      </div>

      {/* Track row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CityNode name={from} side="left" reached />

        <div style={{ position: 'relative', flex: 1, height: avSize + 28 }}>
          {/* Dashed intel trail */}
          <svg
            aria-hidden="true"
            style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', width: '100%', height: 12, overflow: 'visible' }}
            viewBox="0 0 100 12" preserveAspectRatio="none"
          >
            {/* Route still ahead — dim dashes */}
            <line x1="0" y1="6" x2="100" y2="6"
              stroke="var(--phosphor-dim)" strokeOpacity="0.35" strokeWidth="2"
              strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            {/* Ground covered — team vector, solid */}
            {state !== 'empty' && (
              <line x1="0" y1="6" x2={maxPct} y2="6"
                stroke={state === 'end' ? 'var(--phosphor)' : 'var(--phosphor-hot)'} strokeWidth="3"
                vectorEffect="non-scaling-stroke" />
            )}
            {/* Glowing leading edge — the live dash segment */}
            {state === 'default' && maxPct > 0 && maxPct < 100 && (
              <line x1={maxPct} y1="6" x2={Math.min(100, maxPct + 8)} y2="6"
                stroke="var(--phosphor)" strokeWidth="3"
                strokeDasharray="4 4" vectorEffect="non-scaling-stroke"
                style={{ animation: 'sc-trail-pulse 1.6s var(--ease-in-out) infinite' }} />
            )}
          </svg>

          {/* Team tokens */}
          {state !== 'empty' && players.map((p, i) => (
            <div key={p.id || i} style={{
              position: 'absolute', top: '50%',
              left: `${Math.min(100, Math.max(0, p.pct))}%`,
              transform: `translate(-50%, calc(-50% + ${offsets.get(i) ?? 0}px))`,
              zIndex: p.leader ? 3 : 2,
              transition: 'left var(--dur-hop) var(--ease-spring)',
            }}>
              <Avatar
                size={avSize}
                colorway={p.colorway || 'chicago'}
                ring={p.leader ? 'var(--phosphor)' : 'var(--grid-line)'}
              />
            </div>
          ))}

          {/* Empty state — dormant channel note */}
          {state === 'empty' && (
            <span style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -140%)',
              fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--phosphor-dim)',
              whiteSpace: 'nowrap',
            }}>No telemetry yet</span>
          )}
        </div>

        <CityNode name={to} side="right" selena reached={state === 'end'} />
      </div>

      {/* End state: caught up */}
      {state === 'end' && (
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
          color: 'var(--phosphor)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase',
          borderTop: '1px solid var(--hairline-paper)', paddingTop: 7,
          textAlign: 'center',
        }}>
          Destination reached — she was just here
        </div>
      )}
    </div>
  );
}

export default ProgressStrip;
