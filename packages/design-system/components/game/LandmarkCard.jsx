import * as React from 'react';
import { getCityIcon } from './CityBadge.jsx';

/* ============================================================
   LandmarkCard — shared Field Ops Intel + Dossier card.
   Decoded cards are tan printouts with a duotone thumbnail.
   Locked cards stay compact and subordinate.
   ============================================================ */

function formatUpper(value) {
  return String(value || '').toUpperCase();
}

export function LandmarkCard({
  variant = 'decoded',
  cityName = 'Unknown',
  landmarkName = 'Encrypted landmark',
  funFact,
  image,
  scoutedBy,
  scoutedByHref,
  dateLabel,
  confirmed = false,
  style,
}) {
  const CityIcon = getCityIcon(cityName);
  const locked = variant === 'locked';

  if (locked) {
    return (
      <article
        style={{
          position: 'relative',
          minHeight: 92,
          padding: 'var(--space-sm)',
          background: 'var(--screen-700)',
          border: '1px solid var(--hairline-paper)',
          boxShadow: 'var(--bevel-raised)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'var(--space-2xs)',
          color: 'var(--phosphor-dim)',
          overflow: 'hidden',
          ...style,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 15,
            letterSpacing: '0.18em',
            color: 'var(--grid-line)',
            userSelect: 'none',
          }}
        >
          ▮▮▮ ▮▮▮▮
        </div>
        <span
          style={{
            position: 'absolute',
            top: 'var(--space-xs)',
            right: 'var(--space-sm)',
            transform: 'rotate(-6deg)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--signal-red)',
            border: '1.5px solid var(--signal-red)',
            padding: '0 var(--space-2xs)',
            opacity: 0.9,
          }}
        >
          Encrypted
        </span>
        <p
          style={{
            margin: 0,
            maxWidth: '24ch',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            lineHeight: 1.35,
            color: 'var(--phosphor-dim)',
          }}
        >
          Keep the lines coming.
        </p>
      </article>
    );
  }

  const attribution = scoutedBy
    ? `SCOUTED BY ${formatUpper(scoutedBy)}${dateLabel ? ` · ${formatUpper(dateLabel)}` : ''}`
    : dateLabel
      ? `SCOUTED · ${formatUpper(dateLabel)}`
      : 'SCOUTED';

  return (
    <article
      data-confirmed={confirmed ? 'true' : 'false'}
      style={{
        position: 'relative',
        padding: 'var(--space-sm)',
        /* Warm tan "printout" paper — a matte case-file, not a glowing screen */
        background: confirmed
          ? 'linear-gradient(var(--tan-200), var(--tan-200)) padding-box, linear-gradient(120deg, var(--phosphor), var(--phosphor-hot), var(--phosphor-hot), var(--phosphor)) border-box'
          : 'var(--tan-200)',
        border: confirmed ? '2px solid transparent' : '1px solid var(--case-600)',
        boxShadow: confirmed ? 'var(--bevel-raised), var(--glow-live)' : 'var(--bevel-raised)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2xs)',
        color: 'var(--case-900)',
        textShadow: 'none', /* paper does not glow */
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          aspectRatio: '16 / 10',
          display: 'grid',
          placeItems: 'center',
          background:
            'radial-gradient(circle at 50% 32%, var(--case-700) 0%, var(--case-800) 72%, var(--case-900) 100%)',
          boxShadow: 'var(--bevel-raised)',
          marginBottom: 'var(--space-xs)',
          overflow: 'hidden',
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.35) saturate(0.8)' }}
          />
        ) : CityIcon ? (
          <CityIcon color="var(--tan-200)" />
        ) : null}
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          /* red-on-paper uses the darker red-deep for AA on tan */
          color: 'var(--red-deep)',
        }}
      >
        {cityName}
      </span>
      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.05,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: 'var(--case-900)',
        }}
      >
        {landmarkName}
      </h3>
      {funFact && (
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontStyle: 'italic',
            lineHeight: 1.35,
            color: 'var(--case-800)',
          }}
        >
          {funFact}
        </p>
      )}
      <span
        style={{
          marginTop: 'var(--space-2xs)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--case-700)',
        }}
      >
        {scoutedByHref ? (
          <a href={scoutedByHref} style={{ color: 'inherit', textDecoration: 'underline' }}>
            {attribution}
          </a>
        ) : (
          attribution
        )}
      </span>
      {confirmed && (
        <span
          style={{
            position: 'absolute',
            top: 'var(--space-sm)',
            right: 'var(--space-sm)',
            transform: 'rotate(-6deg)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--red-deep)',
            border: '1.5px solid var(--red-deep)',
            padding: '0 var(--space-2xs)',
            background: 'rgba(241, 231, 204, 0.7)',
            textShadow: 'none',
          }}
        >
          Confirmed
        </span>
      )}
    </article>
  );
}

export default LandmarkCard;
