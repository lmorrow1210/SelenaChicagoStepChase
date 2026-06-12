const React = window.React;

/* ============================================================
   Button — primary, secondary, danger, ghost.
   Sizes sm/md/lg. Disabled + loading states.
   ============================================================ */

const VARIANTS = {
  primary: {
    background: 'var(--blue)',
    color: 'var(--navy)',
    border: '1px solid transparent',
    fontWeight: 700,
  },
  secondary: {
    background: 'transparent',
    color: 'var(--blue)',
    border: '1.5px solid var(--blue)',
    fontWeight: 600,
  },
  danger: {
    background: 'var(--red)',
    color: 'var(--cream)',
    border: '1px solid transparent',
    fontWeight: 700,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--cream)',
    border: '1px solid transparent',
    fontWeight: 600,
  },
};

const SIZES = {
  sm: { height: 34, padding: '0 14px', fontSize: 13, gap: 6 },
  md: { height: 44, padding: '0 20px', fontSize: 15, gap: 8 },
  lg: { height: 54, padding: '0 28px', fontSize: 17, gap: 10 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  style,
  ...rest
}) {
  const { Icon } = window.DesignSystem_19034b;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  const hoverBg = {
    primary: 'var(--blue-hover)',
    secondary: 'var(--blue-12)',
    danger: 'var(--red-hover)',
    ghost: 'var(--cream-08)',
  }[variant];

  const css = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    minWidth: s.height,
    padding: s.padding,
    fontFamily: 'var(--font-body)',
    fontSize: s.fontSize,
    fontWeight: v.fontWeight,
    letterSpacing: '0.01em',
    lineHeight: 1,
    borderRadius: 'var(--r-pill)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    background: hover && !isDisabled ? hoverBg : v.background,
    color: v.color,
    border: v.border,
    width: fullWidth ? '100%' : undefined,
    opacity: isDisabled ? 0.45 : 1,
    transform: press && !isDisabled ? 'scale(0.97)' : 'scale(1)',
    transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring)',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    ...style,
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={css}
      {...rest}
    >
      {loading && (
        <span
          style={{
            width: s.fontSize,
            height: s.fontSize,
            borderRadius: '50%',
            border: `2px solid ${variant === 'primary' ? 'rgba(10,22,40,0.35)' : 'rgba(240,232,220,0.3)'}`,
            borderTopColor: 'currentColor',
            animation: 'sc-spin 0.7s linear infinite',
          }}
        />
      )}
      {!loading && icon && <Icon name={icon} size={s.fontSize + 3} />}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size={s.fontSize + 3} />}
    </button>
  );
}
