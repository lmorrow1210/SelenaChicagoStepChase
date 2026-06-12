import * as React from 'react';
import Button from '../core/Button.jsx';
import Input from '../forms/Input.jsx';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   PredictionCard — central card on the Prediction screen.
   Bright illustrated globe backdrop. Headline + numeric input +
   submit, with a post-submission state.
   ============================================================ */

export function PredictionCard({
  headline = "How many steps will the group log this week?",
  city = 'Tokyo',
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
      border: '1px solid var(--hairline)',
      boxShadow: 'var(--shadow-elevated)',
      padding: '28px 26px',
      ...style,
    }}>
      {/* bright illustrated globe backdrop (the one place warmth is allowed) */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(120% 90% at 80% -10%, #2E8B83 0%, #2A6FA8 38%, #15406B 70%, var(--card) 100%)',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%',
        border: '2px dashed rgba(240,232,220,0.25)', zIndex: 0,
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', right: 18, top: 22, color: 'rgba(240,232,220,0.35)', zIndex: 0,
      }}>
        <Icon name="globe" size={88} strokeWidth={1.4} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--blue)',
        }}>This week · {city}</span>

        {!submitted ? (
          <>
            <h2 style={{
              margin: 0, maxWidth: 340, fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 30, lineHeight: 1.05, textTransform: 'uppercase', color: 'var(--cream)',
            }}>{headline}</h2>
            <Input variant="numeric" suffix="steps" placeholder="0" value={value} onChange={onChange} />
            <Button variant="primary" size="lg" fullWidth iconRight="chevronRight" onClick={onSubmit}>
              Lock in prediction
            </Button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', padding: '12px 0' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: '50%', background: 'var(--gold)', color: 'var(--navy)', animation: 'sc-bounce-in var(--dur-skyline) var(--ease-spring) both' }}>
              <Icon name="check" size={28} strokeWidth={3} />
            </span>
            <h2 style={{ margin: '6px 0 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', color: 'var(--cream)' }}>Locked in!</h2>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--cream)' }}>
              You predicted <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{prediction}</b> steps. See you Sunday.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionCard;
