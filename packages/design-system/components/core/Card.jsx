import * as React from 'react';

/* ============================================================
   Card — surface container. Variants: default, elevated.
   ============================================================ */

export function Card({
  children,
  variant = 'default',  // 'default' | 'elevated'
  glow,                 // 'blue' | 'gold' | 'red' | undefined
  padding = 'var(--sp-5)',
  style,
  onClick,
  ...rest
}) {
  const bg = variant === 'elevated' ? 'var(--card-elevated)' : 'var(--card)';
  const shadow = variant === 'elevated' ? 'var(--shadow-elevated)' : 'var(--shadow-card)';
  const glowShadow = glow ? `, var(--glow-${glow})` : '';
  return (
    <div
      onClick={onClick}
      style={{
        background: bg,
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-card)',
        boxShadow: `${shadow}${glowShadow}`,
        padding,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
