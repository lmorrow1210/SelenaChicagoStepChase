import * as React from 'react';
import { Icon } from '../icons/Icon.jsx';

/* ============================================================
   SkyscraperPair v4 — Nemesis duel. Building height = steps.
   YOU = a phosphor-green tower; the rival = a tan-500 tower —
   distinct by hue, both inside the field-terminal palette.
   Windows are punched dark (case-shadow). The winner takes the
   crown, a phosphor-hot edge, and the live glow. Square corners.
   Outcomes: you / nemesis / tie / progress (animates up).
   ============================================================ */

function Tower({ label, pct, win, animate, kind }) {
  // reduced-motion skips the rise (M6 acceptance); inline animation can't be
  // overridden from a stylesheet, so gate it here (SSR-safe)
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rise = animate && !reducedMotion;
  const height = Math.max(8, Math.min(100, pct));
  const you = kind === 'you';
  const barBg = you ? 'var(--phosphor)' : 'var(--tan-500)';
  const idleEdge = you ? 'var(--phosphor-dim)' : 'var(--case-700)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      {win ? (
        <span style={{ color: 'var(--phosphor-hot)', filter: 'drop-shadow(var(--glow-live))' }}>
          <Icon name="crown" size={26} />
        </span>
      ) : (
        <span style={{ height: 26 }} />
      )}
      <div style={{ position: 'relative', width: '100%', maxWidth: 88, height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          height: `${height}%`,
          background: barBg,
          border: `2px solid ${win ? 'var(--phosphor-hot)' : idleEdge}`,
          boxShadow: win ? 'var(--glow-live)' : 'var(--bevel-raised-shadow)',
          transformOrigin: 'bottom',
          animation: rise ? `sc-bounce-up var(--dur-skyline) var(--ease-spring) both` : 'none',
          position: 'relative',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center',
          paddingTop: 8, gap: 6, overflow: 'hidden',
        }}>
          {/* windows — punched dark on the lit facade */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: 'var(--case-shadow)', opacity: 0.7 }} />
              <span style={{ width: 8, height: 8, background: 'var(--case-shadow)', opacity: 0.5 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 14, textTransform: 'uppercase',
          color: win ? 'var(--phosphor-hot)' : 'var(--phosphor)',
          maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{label}</div>
      </div>
    </div>
  );
}

export function SkyscraperPair({
  you = { label: 'You', steps: 8200 },
  nemesis = { label: 'Nemesis', steps: 7400 },
  outcome,             // 'you' | 'nemesis' | 'tie' | 'progress' (auto if omitted)
  max: maxProp,        // normalize heights to this (e.g. week max) instead of the pair max
  animate = false,
  style,
}) {
  const max = Math.max(maxProp ?? 0, you.steps, nemesis.steps, 1);
  const youPct = (you.steps / max) * 100;
  const nemPct = (nemesis.steps / max) * 100;
  const result = outcome || (you.steps === nemesis.steps ? 'tie' : you.steps > nemesis.steps ? 'you' : 'nemesis');

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 18, padding: '18px 20px',
      background: 'var(--screen-700)', border: '1px solid var(--hairline-paper)',
      borderRadius: 'var(--r-card)',
      boxShadow: 'var(--bevel-raised-shadow), var(--shadow-card)',
      ...style,
    }}>
      <Tower label={you.label} pct={youPct} kind="you"
        win={result === 'you' || result === 'tie'} animate={animate} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 90, color: 'var(--phosphor-dim)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>VS</span>
      </div>
      <Tower label={nemesis.label} pct={nemPct} kind="rival"
        win={result === 'nemesis' || result === 'tie'} animate={animate} />
    </div>
  );
}

export default SkyscraperPair;
