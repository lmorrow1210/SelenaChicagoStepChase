import * as React from 'react';
import Button from '../core/Button.jsx';
import Input from '../forms/Input.jsx';
import Slider from '../forms/Slider.jsx';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   PredictionCard v3 — Intercept Forecast (§9B).
   Open state: ink console card, condensed-caps headline, a big
   amber DM Mono readout driven by a large slider with a synced
   numeric input, FILE FORECAST command, stake reminder copy,
   and an optional teammate-preview strip.
   Locked state: the card presses IN (inset bevel) and a red
   CONFIDENTIAL-style stamp slams across it at -8°.
   ============================================================ */

const fmt = (v) => Number(v || 0).toLocaleString();

export function PredictionCard({
  headline = "How many steps will the group log this week?",
  city = 'Chicago',
  value = 0,            // number — current forecast
  min = 0,
  max = 300000,
  step = 1000,
  onChange,             // (steps: number) => void
  onSubmit,
  submitted = false,
  prediction,           // formatted string shown once filed
  stakeNote = 'Stake: the closest call takes Oracle honors when the board seals.',
  teammates,            // optional node — teammate preview strip
  style,
}) {
  const clamp = (n) => Math.max(min, Math.min(max, n));

  function handleInput(e) {
    const digits = String(e.target.value).replace(/[^\d]/g, '');
    if (onChange) onChange(clamp(Number(digits || 0)));
  }

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 'var(--r-card)',
      border: '1px solid var(--hairline-paper)',
      background: 'var(--screen-700)',
      boxShadow: submitted
        ? 'var(--bevel-pressed-shadow)'
        : 'var(--bevel-raised-shadow), var(--shadow-elevated)',
      padding: '22px 20px',
      transition: 'box-shadow var(--dur-base) var(--ease-out)',
      ...style,
    }}>
      {/* Faint globe intel-motif in the corner */}
      <div aria-hidden="true" style={{
        position: 'absolute', right: 16, top: 18, color: 'rgba(var(--phosphor-glow),0.12)', zIndex: 0,
      }}>
        <Icon name="globe" size={80} strokeWidth={1.4} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
          letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--phosphor-dim)',
        }}>[ Intercept forecast · {city} ]</span>

        {!submitted ? (
          <>
            <h2 style={{
              margin: 0, maxWidth: 360, fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 28, lineHeight: 1.02, letterSpacing: '0.02em',
              textTransform: 'uppercase', color: 'var(--phosphor)',
            }}>{headline}</h2>

            {/* Big amber readout — the dialed forecast */}
            <div style={{
              padding: '10px 14px',
              background: 'var(--screen-700)',
              boxShadow: 'var(--screen-inset-shadow)',
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
                fontSize: 'clamp(30px, 5vw, 42px)', lineHeight: 1, color: 'var(--phosphor)',
                textShadow: '0 0 12px rgba(var(--phosphor-glow), 0.30)',
              }}>{fmt(value)}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--phosphor-dim)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>steps</span>
            </div>

            <Slider
              value={clamp(value)}
              min={min}
              max={max}
              step={step}
              onChange={(v) => onChange && onChange(v)}
            />

            <Input
              variant="numeric"
              suffix="steps"
              placeholder="0"
              inputMode="numeric"
              value={value ? fmt(value) : ''}
              onChange={handleInput}
              inputStyle={{ fontSize: 26, color: 'var(--phosphor)' }}
            />

            {teammates}

            <Button variant="primary" size="lg" fullWidth iconRight="chevronRight" onClick={onSubmit}>
              File forecast
            </Button>

            {stakeNote && (
              <p style={{
                margin: 0, fontFamily: 'var(--font-body)', fontSize: 12,
                color: 'var(--phosphor-dim)',
              }}>{stakeNote}</p>
            )}
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
              borderRadius: 'var(--r-tight)', padding: '3px 10px',
              transform: 'rotate(-8deg)',
              animation: 'sc-stamp var(--dur-slow) var(--ease-spring) both',
              boxShadow: 'inset 0 0 8px rgba(255,59,48,0.15)',
              opacity: 0.92,
            }}>Locked in</span>

            <h2 style={{
              margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
              textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--phosphor)',
            }}>Forecast filed</h2>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--phosphor-dim)' }}>
              Your call:{' '}
              <b style={{
                fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
                color: 'var(--phosphor)', fontWeight: 500,
              }}>{prediction}</b>{' '}
              steps. Sealed until Sunday 11:59 PM.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionCard;
