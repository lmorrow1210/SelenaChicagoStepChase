import * as React from 'react';

/* ============================================================
   Slider v3 — "Midnight Dossier" range input. Square amber
   thumb riding an inset ink channel; amber fill = dialed value.
   Sharp 90° corners throughout.
   ============================================================ */

export function Slider({
  value = 8000,
  min = 2000,
  max = 20000,
  step = 500,
  onChange,
  label,
  format = (v) => v.toLocaleString(),
  disabled = false,
  style,
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', opacity: disabled ? 0.5 : 1, ...style }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
            letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--phosphor-dim)',
          }}>{label}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
            fontSize: 18, color: 'var(--phosphor)',
          }}>
            {format(value)}
          </span>
        </div>
      )}
      <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 8,
          background: 'var(--screen-700)', boxShadow: 'var(--screen-inset-shadow)',
        }} />
        <div style={{
          position: 'absolute', left: 0, width: `${pct}%`, height: 8,
          background: 'var(--phosphor)',
        }} />
        <input
          type="range"
          aria-label={label || 'Slider'}
          min={min} max={max} step={step} value={value} disabled={disabled}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{
            position: 'absolute', left: 0, right: 0, width: '100%',
            margin: 0, appearance: 'none', WebkitAppearance: 'none',
            background: 'transparent', height: 28, cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          className="sc-slider"
        />
      </div>
      <style>{`
        .sc-slider::-webkit-slider-thumb{
          -webkit-appearance:none;appearance:none;width:20px;height:26px;border-radius:var(--r-tight);
          background:var(--phosphor);border:2px solid var(--screen-base);
          box-shadow:var(--bevel-raised), var(--glow-live);cursor:pointer;
        }
        .sc-slider::-moz-range-thumb{
          width:20px;height:26px;border-radius:var(--r-tight);background:var(--phosphor);
          border:2px solid var(--screen-base);box-shadow:var(--bevel-raised);cursor:pointer;
        }
      `}</style>
    </div>
  );
}

export default Slider;
