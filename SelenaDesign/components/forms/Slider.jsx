const React = window.React;

/* ============================================================
   Slider — step-target range input. Blue track fill, blue thumb.
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
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)',
          }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: 'var(--blue)' }}>
            {format(value)}
          </span>
        </div>
      )}
      <div style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3,
          background: 'var(--hairline)',
        }} />
        <div style={{
          position: 'absolute', left: 0, width: `${pct}%`, height: 6, borderRadius: 3,
          background: 'var(--blue)',
        }} />
        <input
          type="range"
          min={min} max={max} step={step} value={value} disabled={disabled}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{
            position: 'absolute', left: 0, right: 0, width: '100%',
            margin: 0, appearance: 'none', WebkitAppearance: 'none',
            background: 'transparent', height: 24, cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          className="sc-slider"
        />
      </div>
      <style>{`
        .sc-slider::-webkit-slider-thumb{
          -webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;
          background:var(--blue);border:3px solid var(--navy);
          box-shadow:0 0 0 1px var(--blue), var(--glow-blue);cursor:pointer;
        }
        .sc-slider::-moz-range-thumb{
          width:22px;height:22px;border-radius:50%;background:var(--blue);
          border:3px solid var(--navy);box-shadow:0 0 0 1px var(--blue);cursor:pointer;
        }
      `}</style>
    </div>
  );
}
