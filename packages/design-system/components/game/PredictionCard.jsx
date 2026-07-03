import * as React from 'react';
import Button from '../core/Button.jsx';
import Input from '../forms/Input.jsx';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   PredictionCard v3 — Intercept Forecast (§9B).
   Open state: ink console card, condensed-caps headline, amber
   numeric input, lock-in command.
   Locked state: the card presses IN (inset bevel) and a red
   CONFIDENTIAL-style stamp slams across it at -8°.
   ============================================================ */

export function PredictionCard({
  headline = "How many steps will the group log this week?",
  city = 'Chicago',
  value = '',
  onChange,
  onSubmit,
  submitted = false,
  prediction,
  style,
}) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 'var(--r-card)',
      border: '1px solid var(--hairline-paper)',
      background: 'var(--ink-700)',
      boxShadow: submitted
        ? 'var(--bevel-pressed-shadow)'
        : 'var(--bevel-raised-shadow), var(--shadow-elevated)',
      padding: '22px 20px',
      transition: 'box-shadow var(--dur-base) var(--ease-out)',
      ...style,
    }}>
      {/* Faint globe intel-motif in the corner */}
      <div aria-hidden="true" style={{
        position: 'absolute', right: -26, top: -26, width: 150, height: 150, borderRadius: '50%',
        border: '2px dashed rgba(243,236,217,0.10)', zIndex: 0,
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', right: 16, top: 18, color: 'rgba(243,236,217,0.12)', zIndex: 0,
      }}>
        <Icon name="globe" size={80} strokeWidth={1.4} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
          letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--bone-dim)',
        }}>[ Intercept forecast · {city} ]</span>

        {!submitted ? (
          <>
            <h2 style={{
              margin: 0, maxWidth: 360, fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 28, lineHeight: 1.02, letterSpacing: '0.02em',
              textTransform: 'uppercase', color: 'var(--bone)',
            }}>{headline}</h2>
            <Input variant="numeric" suffix="steps" placeholder="0" value={value} onChange={onChange} />
            <Button variant="primary" size="lg" fullWidth iconRight="chevronRight" onClick={onSubmit}>
              Lock in the call
            </Button>
          </>
        ) : (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', padding: '18px 0 14px' }}>
            {/* Red confidential stamp — slams in at -8° (sc-stamp) */}
            <span aria-hidden="true" style={{
              position: 'absolute', top: 2, right: 4,
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--signal-red)',
              border: '2.5px solid var(--signal-red)',
              borderRadius: 3, padding: '3px 10px',
              transform: 'rotate(-8deg)',
              animation: 'sc-stamp var(--dur-slow) var(--ease-spring) both',
              boxShadow: 'inset 0 0 8px rgba(255,59,48,0.15)',
              opacity: 0.92,
            }}>Locked in</span>

            <h2 style={{
              margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
              textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--bone)',
            }}>Forecast filed</h2>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--manila)' }}>
              Your call:{' '}
              <b style={{
                fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
                color: 'var(--amber)', fontWeight: 500,
              }}>{prediction}</b>{' '}
              steps. Sealed until Sunday.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionCard;
