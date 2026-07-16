import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   LandmarkTile v4 — tan photo case-card (Landmark Hunt Desk).
   Unlocked = duotone landmark vignette on tan paper with a
   field note. Locked = ink overlay + red [REDACTED] stamp.
   Today = locked but live: phosphor edge pulse marks the active file.
   ============================================================ */

export function LandmarkTile({
  name = 'Senso-ji',
  fact = '',
  state = 'unlocked',   // 'locked' | 'unlocked' | 'today'
  color = 'var(--map-land-teal)',
  icon = 'city',
  style,
}) {
  const isUnlocked = state === 'unlocked';
  const isToday = state === 'today';

  return (
    <div style={{
      position: 'relative', display: 'flex', flexDirection: 'column',
      borderRadius: 'var(--r-card)', overflow: 'hidden',
      /* Unlocked = warm tan printout (with paper-grain tooth);
         locked/today = green screen file */
      background: isUnlocked ? 'var(--paper-grain) var(--tan-200)' : 'var(--screen-700)',
      border: `1px solid ${isToday ? 'var(--phosphor)' : isUnlocked ? 'var(--case-600)' : 'var(--grid-line)'}`,
      boxShadow: isToday
        ? 'var(--bevel-raised-shadow), var(--glow-live)'
        : 'var(--bevel-raised-shadow), var(--shadow-card)',
      textShadow: isUnlocked ? 'none' : 'var(--text-glow)',
      animation: isToday ? 'sc-pulse-amber 1.8s var(--ease-in-out) infinite' : 'none',
      minHeight: 128, ...style,
    }}>
      {/* Photo area — duotone vignette (case brown well, phosphor rim) */}
      <div style={{
        flex: 1, display: 'grid', placeItems: 'center', minHeight: 74,
        position: 'relative',
        background: isUnlocked
          ? 'radial-gradient(circle at 50% 30%, var(--case-700) 0%, var(--case-800) 78%, var(--case-900) 100%)'
          : 'var(--screen-base)',
        color: isUnlocked ? 'var(--phosphor-dim)' : 'var(--grid-line)',
      }}>
        <Icon
          name={icon}
          size={40}
          strokeWidth={1.8}
          style={{
            opacity: isUnlocked ? 1 : 0.6,
            filter: isUnlocked ? 'drop-shadow(0 0 6px rgba(var(--phosphor-glow),0.30))' : 'none',
          }}
        />
        {/* Locked: red [REDACTED] stamp across the photo */}
        {!isUnlocked && (
          <span aria-hidden="true" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-8deg)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--signal-red)',
            border: '2px solid var(--signal-red)',
            borderRadius: 'var(--r-tight)',
            padding: '1px 8px',
            opacity: 0.85,
            whiteSpace: 'nowrap',
          }}>Redacted</span>
        )}
        {/* File corner cut — case-file chrome */}
        <span aria-hidden="true" style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderTop: `14px solid ${isUnlocked ? 'var(--tan-300)' : 'var(--screen-700)'}`,
          borderLeft: '14px solid transparent',
        }} />
      </div>

      {/* Label strip — tan field note when unlocked */}
      <div style={{
        padding: '8px 10px',
        background: isUnlocked ? 'var(--paper-grain) var(--tan-200)' : 'transparent',
        borderTop: isUnlocked ? '1px solid var(--case-600)' : '1px solid var(--grid-line)',
      }}>
        {isUnlocked ? (
          <>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: 'var(--case-900)', lineHeight: 1.15,
            }}>{name}</div>
            {fact && (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 12,
                color: 'var(--case-700)', marginTop: 2, lineHeight: 1.45,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                  color: 'var(--red-deep)', textTransform: 'uppercase', marginRight: 5,
                }}>Field note:</span>
                {fact}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--phosphor-dim)' }}>
            <Icon name="lock" size={13} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500 }}>
              {isToday ? "Today's coordinate — sync to unlock" : 'Clearance pending'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandmarkTile;
