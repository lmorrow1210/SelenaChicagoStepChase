/* @ds-bundle: {"format":3,"namespace":"DesignSystem_19034b","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CountdownPill","sourcePath":"components/core/CountdownPill.jsx"},{"name":"StatCard","sourcePath":"components/core/StatCard.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Slider","sourcePath":"components/forms/Slider.jsx"},{"name":"COLORWAYS","sourcePath":"components/game/Avatar.jsx"},{"name":"SKIN_TONES","sourcePath":"components/game/Avatar.jsx"},{"name":"HAIR_COLORS","sourcePath":"components/game/Avatar.jsx"},{"name":"Avatar","sourcePath":"components/game/Avatar.jsx"},{"name":"BingoTile","sourcePath":"components/game/BingoTile.jsx"},{"name":"CityBadge","sourcePath":"components/game/CityBadge.jsx"},{"name":"LandmarkTile","sourcePath":"components/game/LandmarkTile.jsx"},{"name":"MapPin","sourcePath":"components/game/MapPin.jsx"},{"name":"PredictionCard","sourcePath":"components/game/PredictionCard.jsx"},{"name":"ProgressStrip","sourcePath":"components/game/ProgressStrip.jsx"},{"name":"SkyscraperPair","sourcePath":"components/game/SkyscraperPair.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/icons/Icon.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"b40d3a8695ab","components/core/Button.jsx":"ae803f22990e","components/core/Card.jsx":"8571801ba451","components/core/CountdownPill.jsx":"c87b16f2f9ef","components/core/StatCard.jsx":"0d7cbac69007","components/feedback/EmptyState.jsx":"a57064df0a82","components/feedback/Skeleton.jsx":"c3b91f5ec949","components/feedback/Toast.jsx":"28e599c2a052","components/forms/Input.jsx":"fdc58706fe6e","components/forms/Slider.jsx":"98a6ddfc0162","components/game/Avatar.jsx":"5b74474980b0","components/game/BingoTile.jsx":"95460637175b","components/game/CityBadge.jsx":"2b4b7b5e15c8","components/game/LandmarkTile.jsx":"882adea19170","components/game/MapPin.jsx":"78c7f080e7f5","components/game/PredictionCard.jsx":"71aa0ece8488","components/game/ProgressStrip.jsx":"e6fc8e9efae1","components/game/SkyscraperPair.jsx":"447e745ef846","components/icons/Icon.jsx":"9812d82cf821","components/navigation/Sidebar.jsx":"e52acaf4dc1c","components/navigation/TabBar.jsx":"842dd88e313e","ui_kits/selenas-chase/AppShell.jsx":"0e87f6c667c0","ui_kits/selenas-chase/BingoScreen.jsx":"65aa16e7bb9c","ui_kits/selenas-chase/CityScreen.jsx":"db78c27bc7a3","ui_kits/selenas-chase/MapScreen.jsx":"dc3958a43163","ui_kits/selenas-chase/NemesisScreen.jsx":"b8f99e752abe","ui_kits/selenas-chase/PredictionScreen.jsx":"40ac853a2495","ui_kits/selenas-chase/WorldMap.jsx":"6bcfc8cae380"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_19034b = window.DesignSystem_19034b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const React = window.React;

/* ============================================================
   Badge — small status chip / tag.
   Tones: blue, gold, red, bronze, silver, muted.
   ============================================================ */

const TONES = {
  blue: {
    bg: 'var(--blue-12)',
    fg: 'var(--blue)',
    bd: 'var(--blue-40)'
  },
  gold: {
    bg: 'var(--gold-12)',
    fg: 'var(--gold)',
    bd: 'var(--gold-20)'
  },
  red: {
    bg: 'var(--red-12)',
    fg: '#FF6B6B',
    bd: 'rgba(204,0,0,0.4)'
  },
  bronze: {
    bg: 'rgba(205,127,50,0.14)',
    fg: 'var(--bronze)',
    bd: 'rgba(205,127,50,0.4)'
  },
  silver: {
    bg: 'rgba(168,169,173,0.14)',
    fg: 'var(--silver)',
    bd: 'rgba(168,169,173,0.4)'
  },
  muted: {
    bg: 'var(--cream-08)',
    fg: 'var(--muted)',
    bd: 'var(--hairline)'
  }
};
function Badge({
  children,
  tone = 'blue',
  icon,
  solid = false,
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  const t = TONES[tone] || TONES.blue;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: 24,
      padding: '0 10px',
      borderRadius: 'var(--r-pill)',
      background: solid ? t.fg : t.bg,
      color: solid ? 'var(--navy)' : t.fg,
      border: solid ? 'none' : `1px solid ${t.bd}`,
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 13
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    fontWeight: 700
  },
  secondary: {
    background: 'transparent',
    color: 'var(--blue)',
    border: '1.5px solid var(--blue)',
    fontWeight: 600
  },
  danger: {
    background: 'var(--red)',
    color: 'var(--cream)',
    border: '1px solid transparent',
    fontWeight: 700
  },
  ghost: {
    background: 'transparent',
    color: 'var(--cream)',
    border: '1px solid transparent',
    fontWeight: 600
  }
};
const SIZES = {
  sm: {
    height: 34,
    padding: '0 14px',
    fontSize: 13,
    gap: 6
  },
  md: {
    height: 44,
    padding: '0 20px',
    fontSize: 15,
    gap: 8
  },
  lg: {
    height: 54,
    padding: '0 28px',
    fontSize: 17,
    gap: 10
  }
};
function Button({
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
  const {
    Icon
  } = window.DesignSystem_19034b;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;
  const hoverBg = {
    primary: 'var(--blue-hover)',
    secondary: 'var(--blue-12)',
    danger: 'var(--red-hover)',
    ghost: 'var(--cream-08)'
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
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: isDisabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: css
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    style: {
      width: s.fontSize,
      height: s.fontSize,
      borderRadius: '50%',
      border: `2px solid ${variant === 'primary' ? 'rgba(10,22,40,0.35)' : 'rgba(240,232,220,0.3)'}`,
      borderTopColor: 'currentColor',
      animation: 'sc-spin 0.7s linear infinite'
    }
  }), !loading && icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: s.fontSize + 3
  }), children, !loading && iconRight && /*#__PURE__*/React.createElement(Icon, {
    name: iconRight,
    size: s.fontSize + 3
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const React = window.React;

/* ============================================================
   Card — surface container. Variants: default, elevated.
   ============================================================ */

function Card({
  children,
  variant = 'default',
  // 'default' | 'elevated'
  glow,
  // 'blue' | 'gold' | 'red' | undefined
  padding = 'var(--sp-5)',
  style,
  onClick,
  ...rest
}) {
  const bg = variant === 'elevated' ? 'var(--card-elevated)' : 'var(--card)';
  const shadow = variant === 'elevated' ? 'var(--shadow-elevated)' : 'var(--shadow-card)';
  const glowShadow = glow ? `, var(--glow-${glow})` : '';
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    style: {
      background: bg,
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-card)',
      boxShadow: `${shadow}${glowShadow}`,
      padding,
      cursor: onClick ? 'pointer' : undefined,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/CountdownPill.jsx
try { (() => {
const React = window.React;

/* ============================================================
   CountdownPill — days/hours until week closes.
   Color shifts as deadline nears: muted → gold (2d) → red (24h).
   ============================================================ */

function tone(hoursLeft) {
  if (hoursLeft <= 24) return {
    fg: 'var(--red)',
    bg: 'var(--red-12)',
    bd: 'rgba(204,0,0,0.4)'
  };
  if (hoursLeft <= 48) return {
    fg: 'var(--gold)',
    bg: 'var(--gold-12)',
    bd: 'var(--gold-20)'
  };
  return {
    fg: 'var(--muted)',
    bg: 'var(--cream-08)',
    bd: 'var(--hairline)'
  };
}
function fmt(hoursLeft) {
  if (hoursLeft <= 0) return 'Closed';
  if (hoursLeft < 24) return `${hoursLeft}h left`;
  const d = Math.floor(hoursLeft / 24);
  const h = hoursLeft % 24;
  return h ? `${d}d ${h}h left` : `${d}d left`;
}
function CountdownPill({
  hoursLeft = 72,
  label = 'Week closes',
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  const t = tone(hoursLeft);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      height: 30,
      padding: '0 14px',
      borderRadius: 'var(--r-pill)',
      background: t.bg,
      border: `1px solid ${t.bd}`,
      color: t.fg,
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      fontWeight: 500,
      ...style
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      color: 'var(--muted)',
      fontSize: 12
    }
  }, label), /*#__PURE__*/React.createElement("span", null, fmt(hoursLeft)));
}
Object.assign(__ds_scope, { CountdownPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CountdownPill.jsx", error: String((e && e.message) || e) }); }

// components/core/StatCard.jsx
try { (() => {
const React = window.React;

/* ============================================================
   StatCard — compact icon + label + value. Leaderboard / profile.
   ============================================================ */

function StatCard({
  icon,
  label,
  value,
  unit,
  accent = 'var(--blue)',
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      background: 'var(--card)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-card)',
      padding: '16px 18px',
      minWidth: 120,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 28,
      height: 28,
      borderRadius: 'var(--r-tight)',
      background: 'var(--blue-12)',
      color: accent
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 28,
      fontWeight: 500,
      color: 'var(--cream)',
      lineHeight: 1
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--muted)'
    }
  }, unit)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
const React = window.React;

/* ============================================================
   EmptyState — illustration/icon + headline + body + CTA.
   Encouraging, on-brand. Not clinical.
   ============================================================ */

function EmptyState({
  icon = 'globe',
  title,
  body,
  action,
  accent = 'var(--blue)',
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 14,
      padding: '40px 28px',
      maxWidth: 380,
      margin: '0 auto',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: 'var(--card)',
      border: `1.5px dashed ${accent}`,
      color: accent
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 34,
    strokeWidth: 1.8
  })), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 26,
      textTransform: 'uppercase',
      letterSpacing: '-0.01em',
      color: 'var(--cream)'
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      lineHeight: 1.5,
      color: 'var(--muted)'
    }
  }, body), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
const React = window.React;

/* ============================================================
   Skeleton — pulsing loading placeholder.
   Presets: leaderboard row, landmark grid, bingo card.
   ============================================================ */

function Block({
  w = '100%',
  h = 16,
  r = 'var(--r-tight)',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: w,
      height: h,
      borderRadius: r,
      background: 'var(--skeleton)',
      animation: 'sc-skeleton 1.2s var(--ease-in-out) infinite',
      ...style
    }
  });
}
function Skeleton({
  preset = 'leaderboard',
  rows = 4,
  style
}) {
  if (preset === 'landmark') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        ...style
      }
    }, Array.from({
      length: 6
    }).map((_, i) => /*#__PURE__*/React.createElement(Block, {
      key: i,
      w: "100%",
      h: 120,
      r: "var(--r-card)",
      style: {
        animationDelay: `${i * 90}ms`
      }
    })));
  }
  if (preset === 'bingo') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
        ...style
      }
    }, Array.from({
      length: 25
    }).map((_, i) => /*#__PURE__*/React.createElement(Block, {
      key: i,
      w: "100%",
      h: 56,
      r: "var(--r-card)",
      style: {
        aspectRatio: '1',
        height: 'auto',
        animationDelay: `${i * 35}ms`
      }
    })));
  }
  if (preset === 'block') {
    return /*#__PURE__*/React.createElement(Block, {
      style: style
    });
  }
  // leaderboard
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      ...style
    }
  }, Array.from({
    length: rows
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      background: 'var(--card)',
      borderRadius: 'var(--r-card)',
      border: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement(Block, {
    w: 28,
    h: 28,
    r: "50%",
    style: {
      animationDelay: `${i * 90}ms`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Block, {
    w: "40%",
    h: 12,
    style: {
      animationDelay: `${i * 90}ms`
    }
  }), /*#__PURE__*/React.createElement(Block, {
    w: "65%",
    h: 10,
    style: {
      animationDelay: `${i * 90 + 40}ms`
    }
  })), /*#__PURE__*/React.createElement(Block, {
    w: 60,
    h: 16,
    style: {
      animationDelay: `${i * 90}ms`
    }
  }))));
}
Skeleton.Block = Block;
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const React = window.React;

/* ============================================================
   Toast — slim bar at top of screen.
   Types: achievement (gold), social (blue), alert (red).
   ============================================================ */

const TYPES = {
  achievement: {
    accent: 'var(--gold)',
    icon: 'badge'
  },
  social: {
    accent: 'var(--blue)',
    icon: 'nemesis'
  },
  alert: {
    accent: 'var(--red)',
    icon: 'sync'
  }
};
function Toast({
  type = 'social',
  title,
  message,
  icon,
  onClose,
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  const t = TYPES[type] || TYPES.social;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      maxWidth: 460,
      background: 'var(--card-elevated)',
      borderRadius: 'var(--r-card)',
      borderLeft: `4px solid ${t.accent}`,
      boxShadow: 'var(--shadow-elevated)',
      padding: '12px 14px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 32,
      height: 32,
      flex: 'none',
      borderRadius: '50%',
      background: 'transparent',
      color: t.accent
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon || t.icon,
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--cream)'
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--muted)',
      marginTop: 1
    }
  }, message)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Dismiss",
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--muted)',
      display: 'grid',
      placeItems: 'center',
      padding: 4,
      borderRadius: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  })));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const React = window.React;

/* ============================================================
   Input — text, numeric (large mono), with label + focus ring.
   Dark fill (--card), cream text, blue focus ring.
   ============================================================ */

function Input({
  value,
  onChange,
  placeholder,
  label,
  type = 'text',
  variant = 'text',
  // 'text' | 'numeric'
  suffix,
  disabled = false,
  invalid = false,
  style,
  inputStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const isNumeric = variant === 'numeric';
  const wrap = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    ...style
  };
  const field = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--card)',
    border: `1.5px solid ${invalid ? 'var(--red)' : focus ? 'var(--blue)' : 'var(--hairline)'}`,
    borderRadius: isNumeric ? 'var(--r-card)' : 'var(--r-card)',
    boxShadow: focus && !invalid ? '0 0 0 3px var(--blue-20)' : 'none',
    padding: isNumeric ? '14px 18px' : '0 14px',
    height: isNumeric ? 'auto' : 44,
    opacity: disabled ? 0.5 : 1,
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
  };
  const input = {
    flex: 1,
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--cream)',
    fontFamily: isNumeric ? 'var(--font-mono)' : 'var(--font-body)',
    fontSize: isNumeric ? 40 : 15,
    fontWeight: isNumeric ? 500 : 400,
    textAlign: isNumeric ? 'center' : 'left',
    letterSpacing: isNumeric ? '0.02em' : '0',
    ...inputStyle
  };
  return /*#__PURE__*/React.createElement("label", {
    style: wrap
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: field
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: input
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: isNumeric ? 16 : 13,
      color: 'var(--muted)',
      whiteSpace: 'nowrap'
    }
  }, suffix)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Slider.jsx
try { (() => {
const React = window.React;

/* ============================================================
   Slider — step-target range input. Blue track fill, blue thumb.
   ============================================================ */

function Slider({
  value = 8000,
  min = 2000,
  max = 20000,
  step = 500,
  onChange,
  label,
  format = v => v.toLocaleString(),
  disabled = false,
  style
}) {
  const pct = (value - min) / (max - min) * 100;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: '100%',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 18,
      fontWeight: 500,
      color: 'var(--blue)'
    }
  }, format(value))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 24,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 6,
      borderRadius: 3,
      background: 'var(--hairline)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      width: `${pct}%`,
      height: 6,
      borderRadius: 3,
      background: 'var(--blue)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    disabled: disabled,
    onChange: e => onChange && onChange(Number(e.target.value)),
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      width: '100%',
      margin: 0,
      appearance: 'none',
      WebkitAppearance: 'none',
      background: 'transparent',
      height: 24,
      cursor: disabled ? 'not-allowed' : 'pointer'
    },
    className: "sc-slider"
  })), /*#__PURE__*/React.createElement("style", null, `
        .sc-slider::-webkit-slider-thumb{
          -webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;
          background:var(--blue);border:3px solid var(--navy);
          box-shadow:0 0 0 1px var(--blue), var(--glow-blue);cursor:pointer;
        }
        .sc-slider::-moz-range-thumb{
          width:22px;height:22px;border-radius:50%;background:var(--blue);
          border:3px solid var(--navy);box-shadow:0 0 0 1px var(--blue);cursor:pointer;
        }
      `));
}
Object.assign(__ds_scope, { Slider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Slider.jsx", error: String((e && e.message) || e) }); }

// components/game/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const React = window.React;

/* ============================================================
   Avatar — the mini trench-coat + fedora figure.
   Renders at any size (24 leaderboard / 40 strip / 120 profile).
   Parameterized by skinTone, hairColor, colorway (coat + boots).
   Hat always visible; matches coat color by default.
   ============================================================ */

const COLORWAYS = {
  chicago: {
    label: 'Chicago',
    coat: '#7CCDEF',
    boots: '#CC0000'
  },
  midnight: {
    label: 'Midnight',
    coat: '#1A1A2E',
    boots: '#D4A820'
  },
  emerald: {
    label: 'Emerald',
    coat: '#1E4D2B',
    boots: '#F0E8DC'
  },
  crimson: {
    label: 'Crimson',
    coat: '#8B0000',
    boots: '#1A1A1A'
  },
  desert: {
    label: 'Desert',
    coat: '#C4956A',
    boots: '#8B3A0F'
  },
  violet: {
    label: 'Violet',
    coat: '#3D1A6B',
    boots: '#A8A8B8'
  }
};

/* 5 skin tones: fair → deep */
const SKIN_TONES = ['#F2D2B6',
// fair
'#E8B98F',
// light medium
'#C68642',
// medium
'#8B4513',
// dark
'#4A2E1C' // deep
];

/* 5 hair colors: black → dark brown → light brown/tan → red/orange → yellow (blonde) */
const HAIR_COLORS = ['#0D0806',
// black
'#3D1F0C',
// dark brown
'#9B6535',
// light brown / tan
'#C04418',
// red / orange
'#D4A827' // yellow / blonde
];
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt,
    g = (n >> 8 & 255) + amt,
    b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function Avatar({
  size = 40,
  colorway = 'chicago',
  skinTone = SKIN_TONES[1],
  hairColor = HAIR_COLORS[0],
  ring = false,
  // ring color (string) or true for blue
  badge,
  // node rendered top-right (e.g. crown)
  style,
  ...rest
}) {
  const cw = COLORWAYS[colorway] || COLORWAYS.chicago;
  const coatDark = shade(cw.coat, -26);
  const bootDark = shade(cw.boots, -22);
  // Hat: use boot color (always contrasts with coat by design).
  // If boots are too dark (all channels < 55), lighten the coat instead.
  const bootMax = Math.max(parseInt(cw.boots.slice(1, 3), 16), parseInt(cw.boots.slice(3, 5), 16), parseInt(cw.boots.slice(5, 7), 16));
  const hatC = bootMax < 55 ? shade(cw.coat, 28) : shade(cw.boots, -8);
  const hatBand = bootMax < 55 ? shade(cw.coat, -20) : shade(cw.boots, -45);
  const ringColor = ring === true ? 'var(--blue)' : ring;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-grid',
      placeItems: 'center',
      width: size,
      height: size,
      flex: 'none',
      borderRadius: '50%',
      background: 'var(--navy)',
      boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : 'inset 0 0 0 1px var(--hairline)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 56",
    width: size,
    height: size,
    style: {
      display: 'block'
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 56 C9 40 14 34 18 32 L30 32 C34 34 39 40 39 56 Z",
    fill: cw.coat
  }), /*#__PURE__*/React.createElement("path", {
    d: "M24 32 L20.5 56 L27.5 56 Z",
    fill: coatDark
  }), /*#__PURE__*/React.createElement("rect", {
    x: "11",
    y: "44",
    width: "26",
    height: "3.4",
    fill: coatDark,
    opacity: "0.8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 32 L24 39 L20 33 Z",
    fill: shade(cw.coat, 18)
  }), /*#__PURE__*/React.createElement("path", {
    d: "M30 32 L24 39 L28 33 Z",
    fill: shade(cw.coat, 18)
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13.5",
    y: "52",
    width: "8",
    height: "4",
    rx: "1",
    fill: cw.boots
  }), /*#__PURE__*/React.createElement("rect", {
    x: "26.5",
    y: "52",
    width: "8",
    height: "4",
    rx: "1",
    fill: bootDark
  }), /*#__PURE__*/React.createElement("rect", {
    x: "21",
    y: "27",
    width: "6",
    height: "7",
    fill: skinTone
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "24",
    cy: "20",
    r: "9",
    fill: skinTone
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.5 22 C15 18 16 15 18 13.5 C16 15 15.2 18 15.5 22 Z",
    fill: hairColor
  }), /*#__PURE__*/React.createElement("path", {
    d: "M32.5 22 C33 18 32 15 30 13.5 C32 15 32.8 18 32.5 22 Z",
    fill: hairColor
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 14 Q17.5 3 24 2 Q30.5 3 31 14 Z",
    fill: hatC
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "24",
    cy: "14",
    rx: "12.5",
    ry: "2.8",
    fill: hatC
  }), /*#__PURE__*/React.createElement("rect", {
    x: "17",
    y: "12",
    width: "14",
    height: "2.2",
    rx: "0.4",
    fill: hatBand
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.5 13.5 C18.5 7 20.5 3.5 24 2.5",
    stroke: shade(hatC, 30),
    strokeWidth: "1.1",
    fill: "none",
    opacity: "0.35"
  })), badge && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -2,
      right: -2,
      lineHeight: 0
    }
  }, badge));
}
Object.assign(__ds_scope, { COLORWAYS, SKIN_TONES, HAIR_COLORS, Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/game/BingoTile.jsx
try { (() => {
const React = window.React;

/* ============================================================
   BingoTile v2 — Vintage game board tile.
   Bevel-raised when active. Bevel-inset (stamped) when complete.
   States: incomplete | progress | complete | free
   ============================================================ */

function BingoTile({
  label = '10k steps',
  icon = 'step',
  state = 'incomplete',
  // 'incomplete' | 'progress' | 'complete' | 'free'
  highlight = false,
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  const free = state === 'free';
  const complete = state === 'complete' || free;
  const progress = state === 'progress';
  const incomplete = state === 'incomplete';

  /* Background surface */
  const bg = free ? 'var(--selena-deep)' : complete ? 'var(--tobacco)' : progress ? 'var(--felt)' : 'var(--felt)';

  /* Border (bevel direction) */
  const borderColor = complete ? 'var(--bevel-lo) var(--bevel-hi) var(--bevel-hi) var(--bevel-lo)' : /* inset — stamped */
  progress ? 'var(--selena) var(--bevel-lo) var(--bevel-lo) var(--selena)' : /* selena raised */
  free ? 'var(--selena) var(--selena-deep) var(--selena-deep) var(--selena)' : highlight ? 'var(--selena) var(--bevel-lo) var(--bevel-lo) var(--selena)' : 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)'; /* default raised */

  /* Icon & text color */
  const fg = free ? 'var(--selena)' : complete ? 'var(--dust)' : progress ? 'var(--selena)' : 'var(--dust)';
  const textColor = free ? 'var(--parchment)' : complete ? 'var(--dust)' : progress ? 'var(--parchment)' : 'var(--dust)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      textAlign: 'center',
      padding: 8,
      background: bg,
      border: '2px solid',
      borderColor: borderColor,
      animation: highlight ? 'sc-pulse-blue 0.9s var(--ease-in-out) infinite' : 'none',
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base)',
      ...style
    }
  }, complete && !free && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      display: 'grid',
      placeItems: 'center',
      width: 18,
      height: 18,
      background: 'var(--selena)',
      color: 'var(--tobacco)',
      borderLeft: '2px solid var(--bevel-lo)',
      borderBottom: '2px solid var(--bevel-lo)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 11,
    strokeWidth: 3
  })), /*#__PURE__*/React.createElement(Icon, {
    name: free ? 'star' : icon,
    size: 26,
    strokeWidth: complete ? 1.5 : 2,
    color: fg
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: free ? 'var(--font-display)' : 'var(--font-body)',
      fontWeight: free ? undefined : 600,
      fontSize: free ? 9 : 11,
      letterSpacing: free ? '0.04em' : '0.01em',
      lineHeight: 1.2,
      color: textColor,
      textTransform: free ? 'uppercase' : 'none'
    }
  }, free ? 'FREE' : label));
}
Object.assign(__ds_scope, { BingoTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/BingoTile.jsx", error: String((e && e.message) || e) }); }

// components/game/CityBadge.jsx
try { (() => {
const React = window.React;

/* ============================================================
   CityBadge v2 — Collectible city badge.
   Warm parchment palette. Bevel-chrome quality rings.
   Bronze / silver / gold. Locked = greyscale dust.
   Sizes: 48 (collection grid), 80 (featured).
   ============================================================ */

/* Quality ring border-colors (bevel on the ring itself) */
const QUALITY_BORDER = {
  gold: 'var(--gold-light) var(--gold) var(--gold) var(--gold-light)',
  silver: '#C8C8C8 #787878 #787878 #C8C8C8',
  bronze: '#D89048 #906020 #906020 #D89048'
};
const QUALITY_CHECK_BG = {
  gold: 'var(--gold)',
  silver: '#A0A0A0',
  bronze: 'var(--bronze)'
};

/* ── City landmark silhouettes (viewBox 0 0 48 48) ── */
const CITY_ICONS = {
  chicago: ({
    color
  }) => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 48",
    fill: "none",
    "aria-hidden": "true",
    style: {
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "18",
    y: "14",
    width: "12",
    height: "28",
    fill: color,
    rx: "0"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "18",
    y: "14",
    width: "5.5",
    height: "14",
    fill: color,
    rx: "0"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "24.5",
    y: "14",
    width: "5.5",
    height: "14",
    fill: color,
    rx: "0"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "18",
    y: "14",
    width: "12",
    height: "8",
    fill: color,
    rx: "0"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "19.5",
    y: "22",
    width: "9",
    height: "6",
    fill: color,
    rx: "0"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "21",
    y: "6",
    width: "1.8",
    height: "9",
    fill: color,
    rx: "0"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "25.2",
    y: "9",
    width: "1.8",
    height: "6",
    fill: color,
    rx: "0"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "16",
    y: "40",
    width: "16",
    height: "2",
    fill: color,
    rx: "0"
  })),
  tokyo: ({
    color
  }) => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 48",
    fill: "none",
    "aria-hidden": "true",
    style: {
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "23",
    y: "3",
    width: "2",
    height: "10",
    fill: color
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "19,13 29,13 27,10 21,10",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "21",
    y: "13",
    width: "6",
    height: "4",
    fill: color
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "16,20 32,20 30,17 18,17",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "19",
    y: "20",
    width: "10",
    height: "4",
    fill: color
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "13,28 35,28 33,25 15,25",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "18",
    y: "28",
    width: "12",
    height: "4",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "32",
    width: "18",
    height: "3",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "19",
    y: "35",
    width: "10",
    height: "6",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "40",
    width: "20",
    height: "2",
    fill: color
  })),
  cairo: ({
    color
  }) => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 48",
    fill: "none",
    "aria-hidden": "true",
    style: {
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "26,40 44,40 35,18",
    fill: color,
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "4,40 44,40 24,8",
    fill: color
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "32",
    x2: "36",
    y2: "32",
    stroke: "var(--tobacco)",
    strokeWidth: "1",
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "24",
    x2: "32",
    y2: "24",
    stroke: "var(--tobacco)",
    strokeWidth: "1",
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "40",
    width: "44",
    height: "2",
    fill: color
  })),
  oslo: ({
    color
  }) => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 48",
    fill: "none",
    "aria-hidden": "true",
    style: {
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 30 Q24 20 41 30 L39 36 Q24 38 9 36 Z",
    fill: color
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 36 Q24 40 39 36",
    stroke: color,
    strokeWidth: "1.5",
    fill: "none",
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M41 30 Q46 26 44 22 Q40 26 39 30",
    fill: color
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 30 Q3 26 6 23 Q9 27 9 30",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "23",
    y: "14",
    width: "2",
    height: "17",
    fill: color
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 14 L25 28 L34 22 Z",
    fill: color,
    opacity: "0.75"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "19",
    y: "17",
    width: "15",
    height: "1.5",
    fill: color,
    opacity: "0.8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "14",
    cy: "34",
    r: "1.2",
    fill: "var(--tobacco)",
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "20",
    cy: "35",
    r: "1.2",
    fill: "var(--tobacco)",
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "28",
    cy: "35",
    r: "1.2",
    fill: "var(--tobacco)",
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "34",
    cy: "34",
    r: "1.2",
    fill: "var(--tobacco)",
    opacity: "0.5"
  })),
  lima: ({
    color
  }) => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 48",
    fill: "none",
    "aria-hidden": "true",
    style: {
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "8,42 24,12 40,42",
    fill: color,
    opacity: "0.25"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "38",
    width: "32",
    height: "4",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "11",
    y: "32",
    width: "26",
    height: "6",
    fill: color,
    opacity: "0.9"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "26",
    width: "20",
    height: "6",
    fill: color,
    opacity: "0.85"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "17",
    y: "20",
    width: "14",
    height: "6",
    fill: color,
    opacity: "0.8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "14",
    width: "8",
    height: "6",
    fill: color
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "18,14 30,14 24,10",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "42",
    width: "36",
    height: "2",
    fill: color
  }))
};
function SkylineFallback({
  color
}) {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 48",
    fill: "none",
    "aria-hidden": "true",
    style: {
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "28",
    width: "6",
    height: "14",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "16",
    y: "20",
    width: "8",
    height: "22",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "26",
    y: "24",
    width: "6",
    height: "18",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "34",
    y: "30",
    width: "6",
    height: "12",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "16",
    width: "2",
    height: "5",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "42",
    width: "36",
    height: "2",
    fill: color
  }));
}
function CityBadge({
  name = 'Chicago',
  quality = 'gold',
  // 'bronze' | 'silver' | 'gold'
  locked = false,
  size = 80,
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  const featured = size >= 72;
  const iconColor = locked ? 'var(--dust)' : 'var(--parchment)';
  const iconSize = size * 0.62;
  const CityIcon = CITY_ICONS[name.toLowerCase()];
  const ringBorderColor = locked ? 'var(--walnut) var(--bevel-lo) var(--bevel-lo) var(--walnut)' : QUALITY_BORDER[quality];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      width: size + 24,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: size,
      height: size,
      borderRadius: '50%',
      background: locked ? 'var(--tobacco)' : 'var(--mahogany)',
      border: `3px solid`,
      borderColor: ringBorderColor,
      boxShadow: !locked && quality === 'gold' ? '2px 2px 0 0 var(--bevel-lo)' : 'none',
      filter: locked ? 'grayscale(1) brightness(0.6)' : 'none',
      overflow: 'hidden',
      padding: size * 0.1
    }
  }, locked ? /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: size * 0.38,
    strokeWidth: 2,
    color: "var(--dust)"
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: iconSize,
      height: iconSize
    }
  }, CityIcon ? /*#__PURE__*/React.createElement(CityIcon, {
    color: iconColor
  }) : /*#__PURE__*/React.createElement(SkylineFallback, {
    color: iconColor
  })), !locked && featured && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      display: 'grid',
      placeItems: 'center',
      width: size * 0.34,
      height: size * 0.34,
      borderRadius: '50%',
      background: QUALITY_CHECK_BG[quality],
      color: 'var(--tobacco)',
      border: '2px solid var(--tobacco)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: size * 0.2,
    strokeWidth: 3
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: featured ? 11 : 8,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: locked ? 'var(--dust)' : 'var(--parchment)',
      textAlign: 'center',
      lineHeight: 1.4
    }
  }, locked ? '???' : name));
}
Object.assign(__ds_scope, { CityBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/CityBadge.jsx", error: String((e && e.message) || e) }); }

// components/game/LandmarkTile.jsx
try { (() => {
const React = window.React;

/* ============================================================
   LandmarkTile — City screen tile.
   States: locked (silhouette), unlocked (full color + fact),
   today (locked + pulsing blue border).
   ============================================================ */

function LandmarkTile({
  name = 'Senso-ji',
  fact = '',
  state = 'unlocked',
  // 'locked' | 'unlocked' | 'today'
  color = 'var(--map-land-teal)',
  icon = 'city',
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  const isUnlocked = state === 'unlocked';
  const isToday = state === 'today';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 'var(--r-card)',
      overflow: 'hidden',
      background: isUnlocked ? 'var(--card-elevated)' : 'var(--navy-deep)',
      border: `2px solid ${isToday ? 'var(--blue)' : 'var(--hairline)'}`,
      animation: isToday ? 'sc-pulse-blue 1.8s var(--ease-in-out) infinite' : 'none',
      minHeight: 132,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      placeItems: 'center',
      minHeight: 78,
      background: isUnlocked ? `radial-gradient(circle at 50% 35%, ${color} 0%, ${color} 60%, color-mix(in srgb, ${color} 60%, var(--navy)) 100%)` : 'transparent',
      color: isUnlocked ? 'var(--cream)' : 'var(--muted)',
      opacity: isUnlocked ? 1 : 0.55,
      filter: isUnlocked ? 'none' : 'grayscale(1)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: isUnlocked ? icon : isToday ? icon : icon,
    size: 42,
    strokeWidth: 1.8,
    style: {
      opacity: isUnlocked ? 1 : 0.5
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      background: isUnlocked ? 'var(--card)' : 'transparent'
    }
  }, isUnlocked ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 16,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, name), fact && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 2,
      lineHeight: 1.4
    }
  }, fact)) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 500
    }
  }, isToday ? "Today's landmark" : 'Locked'))));
}
Object.assign(__ds_scope, { LandmarkTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/LandmarkTile.jsx", error: String((e && e.message) || e) }); }

// components/game/MapPin.jsx
try { (() => {
const React = window.React;

/* ============================================================
   MapPin v2 — Vintage game world-map marker.
   current (player): gold border, parchment bg
   current + selena: sky-blue — Selena's last sighting
   next:             slate blue — predicted destination
   visited:          muted tan — already investigated
   ============================================================ */

function MapPin({
  variant = 'current',
  // 'current' | 'next' | 'visited'
  label,
  selena = false,
  // true = this is Selena's pin
  size = 'md',
  // 'sm' | 'md'
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  const dim = size === 'sm' ? 16 : 24;
  const headSize = dim + 14;
  const isCurrent = variant === 'current';
  const isNext = variant === 'next';
  const isVisited = variant === 'visited';

  /* Background & icon colors by state */
  const bg = selena && isCurrent ? 'var(--selena)' : isCurrent ? 'var(--mahogany)' : isNext ? 'var(--slate)' : 'var(--walnut)';
  const iconColor = selena && isCurrent ? 'var(--tobacco)' : isCurrent ? 'var(--selena)' : isNext ? 'var(--parchment)' : 'var(--dust)';
  const borderColor = selena && isCurrent ? 'var(--selena-dark) var(--bevel-lo) var(--bevel-lo) var(--selena-dark)' : isCurrent ? 'var(--gold-light) var(--gold) var(--gold) var(--gold-light)' : isNext ? 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)' : 'var(--walnut) var(--bevel-lo) var(--bevel-lo) var(--walnut)';
  const stemColor = selena && isCurrent ? 'var(--selena)' : isCurrent ? 'var(--gold)' : isNext ? 'var(--slate)' : 'var(--dust)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: headSize,
      height: headSize,
      borderRadius: '50%',
      background: bg,
      border: '2px solid',
      borderColor: borderColor,
      color: iconColor,
      boxShadow: isCurrent ? '2px 2px 0 0 var(--bevel-lo)' : 'none'
    }
  }, isCurrent && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: -4,
      borderRadius: '50%',
      border: `2px solid ${selena ? 'var(--selena)' : 'var(--gold)'}`,
      animation: 'sc-pulse-blue 2s var(--ease-in-out) infinite',
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: selena ? 'nemesis' : 'city',
    size: Math.round(dim * 0.7),
    strokeWidth: 2.2
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 2,
      height: 8,
      marginTop: -3,
      background: stemColor,
      opacity: 0.8,
      flexShrink: 0
    }
  }), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 8,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: 'var(--parchment)',
      whiteSpace: 'nowrap',
      background: 'var(--felt)',
      padding: '3px 8px',
      border: '2px solid',
      borderColor: 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)'
    }
  }, label));
}
Object.assign(__ds_scope, { MapPin });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/MapPin.jsx", error: String((e && e.message) || e) }); }

// components/game/PredictionCard.jsx
try { (() => {
const React = window.React;

/* ============================================================
   PredictionCard — central card on the Prediction screen.
   Bright illustrated globe backdrop. Headline + numeric input +
   submit, with a post-submission state.
   ============================================================ */

function PredictionCard({
  headline = "How many steps will the group log this week?",
  city = 'Tokyo',
  value = '',
  onChange,
  onSubmit,
  submitted = false,
  prediction,
  style
}) {
  const {
    Input,
    Button,
    Icon
  } = window.DesignSystem_19034b;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--r-card)',
      border: '1px solid var(--hairline)',
      boxShadow: 'var(--shadow-elevated)',
      padding: '28px 26px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      background: 'radial-gradient(120% 90% at 80% -10%, #2E8B83 0%, #2A6FA8 38%, #15406B 70%, var(--card) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      right: -30,
      top: -30,
      width: 180,
      height: 180,
      borderRadius: '50%',
      border: '2px dashed rgba(240,232,220,0.25)',
      zIndex: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      right: 18,
      top: 22,
      color: 'rgba(240,232,220,0.35)',
      zIndex: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "globe",
    size: 88,
    strokeWidth: 1.4
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--blue)'
    }
  }, "This week \xB7 ", city), !submitted ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      maxWidth: 340,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 30,
      lineHeight: 1.05,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, headline), /*#__PURE__*/React.createElement(Input, {
    variant: "numeric",
    suffix: "steps",
    placeholder: "0",
    value: value,
    onChange: onChange
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    iconRight: "chevronRight",
    onClick: onSubmit
  }, "Lock in prediction")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'flex-start',
      padding: '12px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: 'var(--gold)',
      color: 'var(--navy)',
      animation: 'sc-bounce-in var(--dur-skyline) var(--ease-spring) both'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 28,
    strokeWidth: 3
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '6px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 28,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, "Locked in!"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--cream)'
    }
  }, "You predicted ", /*#__PURE__*/React.createElement("b", {
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--blue)'
    }
  }, prediction), " steps. See you Sunday."))));
}
Object.assign(__ds_scope, { PredictionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/PredictionCard.jsx", error: String((e && e.message) || e) }); }

// components/game/ProgressStrip.jsx
try { (() => {
const React = window.React;

/* ============================================================
   ProgressStrip v2 — Vintage detective trail tracker.
   Carmen Sandiego-style route panel.
   Left city → right city. Player tokens on inset channel.
   ============================================================ */

function CityNode({
  name,
  side,
  reached
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      width: 70,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 46,
      height: 46,
      background: reached ? 'var(--mahogany)' : 'var(--tobacco)',
      border: '2px solid',
      borderColor: reached ? 'var(--gold-light) var(--gold) var(--gold) var(--gold-light)' : 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)',
      color: reached ? 'var(--gold)' : side === 'left' ? 'var(--selena)' : 'var(--linen)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "city",
    size: 22
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 8,
      textTransform: 'uppercase',
      color: reached ? 'var(--gold)' : 'var(--parchment)',
      letterSpacing: '0.04em',
      textAlign: 'center',
      lineHeight: 1.5,
      maxWidth: 70,
      wordBreak: 'break-all'
    }
  }, name));
}
function ProgressStrip({
  from = 'Chicago',
  to = 'Tokyo',
  players = [],
  state = 'default',
  // 'default' | 'end' | 'empty'
  compact = false,
  style
}) {
  const {
    Avatar
  } = window.DesignSystem_19034b;
  const avSize = compact ? 26 : 34;
  const maxPct = players.length ? Math.max(0, ...players.map(p => p.pct)) : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--felt)',
      border: '2px solid',
      borderColor: 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)',
      padding: compact ? '10px 12px' : '14px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 8,
      color: 'var(--dust)',
      letterSpacing: '0.05em',
      borderBottom: '1px solid var(--walnut)',
      paddingBottom: 8
    }
  }, "Trail: ", from, " \u2192 ", to), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(CityNode, {
    name: from,
    side: "left"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      height: avSize + 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 10,
      transform: 'translateY(-50%)',
      background: 'var(--tobacco)',
      border: '2px solid',
      borderColor: 'var(--bevel-lo) var(--bevel-hi) var(--bevel-hi) var(--bevel-lo)',
      overflow: 'hidden'
    }
  }, state === 'empty' ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: 'repeating-linear-gradient(90deg, var(--walnut) 0 5px, transparent 5px 10px)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${maxPct}%`,
      background: state === 'end' ? 'var(--gold)' : 'var(--selena)',
      transition: 'width var(--dur-hop) var(--ease-spring)'
    }
  })), state !== 'empty' && players.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id || i,
    style: {
      position: 'absolute',
      top: '50%',
      left: `${Math.min(100, Math.max(0, p.pct))}%`,
      transform: 'translate(-50%, -50%)',
      zIndex: p.leader ? 3 : 2,
      transition: 'left var(--dur-hop) var(--ease-spring)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '2px solid',
      borderColor: p.leader ? 'var(--gold-light) var(--gold) var(--gold) var(--gold-light)' : 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: avSize,
    colorway: p.colorway || 'chicago',
    ring: p.leader ? 'var(--gold)' : 'var(--walnut)'
  }))))), /*#__PURE__*/React.createElement(CityNode, {
    name: to,
    side: "right",
    reached: state === 'end'
  })), state === 'end' && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 8,
      color: 'var(--gold)',
      letterSpacing: '0.04em',
      borderTop: '1px solid var(--walnut)',
      paddingTop: 8,
      textAlign: 'center'
    }
  }, "Selena reached!"));
}
Object.assign(__ds_scope, { ProgressStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/ProgressStrip.jsx", error: String((e && e.message) || e) }); }

// components/game/SkyscraperPair.jsx
try { (() => {
const React = window.React;

/* ============================================================
   SkyscraperPair — Nemesis duel. Building height = steps.
   Left = you, right = nemesis. Taller gets a gold crown.
   Outcomes: you / nemesis / tie / progress (animates up).
   ============================================================ */

function Tower({
  side,
  label,
  pct,
  win,
  color,
  animate
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 0
    }
  }, win && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gold)',
      filter: 'drop-shadow(var(--glow-gold))'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 26
  })), !win && /*#__PURE__*/React.createElement("span", {
    style: {
      height: 26
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: 88,
      height: 200,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: `${Math.max(8, Math.min(100, pct))}%`,
      background: color,
      border: `2px solid ${win ? 'var(--gold)' : 'color-mix(in srgb, ' + color + ' 70%, var(--navy))'}`,
      borderRadius: '4px 4px 0 0',
      boxShadow: win ? 'var(--glow-gold)' : 'none',
      transformOrigin: 'bottom',
      animation: animate ? `sc-bounce-up var(--dur-skyline) var(--ease-spring) both` : 'none',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 8,
      gap: 6,
      overflow: 'hidden'
    }
  }, Array.from({
    length: 5
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      background: 'var(--gold)',
      opacity: 0.55,
      borderRadius: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      background: 'var(--gold)',
      opacity: 0.35,
      borderRadius: 1
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 14,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, label)), /*#__PURE__*/React.createElement("style", null, `@keyframes sc-bounce-up{0%{height:0}70%{height:calc(${Math.max(8, Math.min(100, pct))}% + 10px)}100%{height:${Math.max(8, Math.min(100, pct))}%}}`));
}
function SkyscraperPair({
  you = {
    label: 'You',
    steps: 8200,
    colorway: 'chicago'
  },
  nemesis = {
    label: 'Nemesis',
    steps: 7400
  },
  outcome,
  // 'you' | 'nemesis' | 'tie' | 'progress' (auto if omitted)
  animate = false,
  style
}) {
  const max = Math.max(you.steps, nemesis.steps, 1);
  const youPct = you.steps / max * 100;
  const nemPct = nemesis.steps / max * 100;
  const result = outcome || (you.steps === nemesis.steps ? 'tie' : you.steps > nemesis.steps ? 'you' : 'nemesis');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 18,
      padding: '18px 20px',
      background: 'var(--card)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-card)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(Tower, {
    side: "you",
    label: you.label,
    pct: youPct,
    win: result === 'you' || result === 'tie',
    color: "var(--blue)",
    animate: animate
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 90,
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 18
    }
  }, "VS")), /*#__PURE__*/React.createElement(Tower, {
    side: "nemesis",
    label: nemesis.label,
    pct: nemPct,
    win: result === 'nemesis' || result === 'tie',
    color: "var(--red)",
    animate: animate
  }));
}
Object.assign(__ds_scope, { SkyscraperPair });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/SkyscraperPair.jsx", error: String((e && e.message) || e) }); }

// components/icons/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const React = window.React;

/* ============================================================
   Icon — Selena's Chase icon set.
   24px grid, 2px stroke, rounded caps/joins, consistent weight.
   Color inherits from `currentColor` (set color via CSS).
   ============================================================ */

const P = {
  /* ---- Nav ---- */
  map: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5L9 4Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 4v13.5M15 6.5V20"
  })),
  prediction: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 3a6 6 0 0 0-3.6 10.8c.5.4.85 1 .95 1.65l.15 1.05h5l.15-1.05c.1-.66.45-1.26.95-1.66A6 6 0 0 0 12 3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 20.5h5M10.5 22.5h3"
  })),
  city: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 21V9l5-2v14M14 21V4l5 2v15M4 21h17"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11v0M7 14v0M7 17v0M16 9v0M16 12v0M16 15v0"
  })),
  bingo: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3.5",
    y: "3.5",
    width: "17",
    height: "17",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 3.5v17M15 3.5v17M3.5 9h17M3.5 15h17"
  })),
  nemesis: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 20V11l3-1.5M18 20V11l-3-1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 9.5 12 4l3 5.5M6 20h12"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 14h0M14.5 14h0M9.5 17h0M14.5 17h0"
  })),
  /* ---- Stats / utility ---- */
  step: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M8 4c-1.5 1-2 3-1.5 5.5C7 12 8.5 13 9 15c.3 1.2 0 2.5-1 3.2-1.3.9-3 .2-3.2-1.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 6c1.5 1 2 3 1.5 5.5C17 14 15.5 15 15 17c-.3 1.2 0 2.5 1 3.2"
  })),
  workout: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 9v6M19 9v6M3 11v2M21 11v2M5 12h14"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "8.5",
    width: "3",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "16",
    y: "8.5",
    width: "3",
    height: "7",
    rx: "1"
  })),
  sleep: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 4h3.5L15 7.5H18.5"
  })),
  heart: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 20S4 14.5 4 9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8 2.2C20 14.5 12 20 12 20Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.5 11h2l1-1.8 1.5 3 1-1.2h3.5"
  })),
  badge: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m12 7 1.1 2.2 2.4.35-1.75 1.7.4 2.4L12 12.5l-2.15 1.15.4-2.4L8.5 9.55l2.4-.35L12 7Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 15-1 6 4-2 4 2-1-6"
  })),
  settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6"
  })),
  sync: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 8a8 8 0 0 0-14.3-2M4 6v3.5h3.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 16a8 8 0 0 0 14.3 2M20 18v-3.5h-3.5"
  })),
  crown: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 8l3.5 3 4.5-6 4.5 6L20 8l-1.5 9h-13L4 8Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.5 20h13"
  })),
  star: /*#__PURE__*/React.createElement("path", {
    d: "m12 4 2.35 4.76 5.25.76-3.8 3.7.9 5.24L12 16.7l-4.7 2.47.9-5.24-3.8-3.7 5.25-.76L12 4Z"
  }),
  /* ---- Misc UI ---- */
  lock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "11",
    width: "14",
    height: "9",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11V8a4 4 0 0 1 8 0v3"
  })),
  check: /*#__PURE__*/React.createElement("path", {
    d: "m5 12.5 4.5 4.5L19 7"
  }),
  close: /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6 6 18"
  }),
  chevronRight: /*#__PURE__*/React.createElement("path", {
    d: "m9 5 7 7-7 7"
  }),
  flame: /*#__PURE__*/React.createElement("path", {
    d: "M12 3c.5 3-1.5 4-2.5 5.5C8 10.5 7 12 7 14a5 5 0 0 0 10 0c0-2.5-1.5-4-2.5-5.5C14 9.5 13 10 12.5 9c-.6-1.2.3-2.5-.5-6Z"
  }),
  clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7.5V12l3 2"
  })),
  globe: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.5 12h17M12 3.5c2.5 2.3 2.5 14.7 0 17M12 3.5c-2.5 2.3-2.5 14.7 0 17"
  })),
  trophy: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M7 4h10v4a5 5 0 0 1-10 0V4Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 6H4.5a2.5 2.5 0 0 0 3 2.4M17 6h2.5a2.5 2.5 0 0 1-3 2.4M10 13.5h4l.5 3.5h-5l.5-3.5ZM8.5 20h7"
  }))
};
function Icon({
  name,
  size = 24,
  strokeWidth = 2,
  color,
  style,
  ...rest
}) {
  const body = P[name];
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color || 'currentColor',
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": rest['aria-label'] ? undefined : true,
    style: {
      display: 'block',
      flex: 'none',
      ...style
    }
  }, rest), body || P.star);
}
const ICON_NAMES = Object.keys(P);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Icon.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
const React = window.React;

/* ============================================================
   Sidebar v2 — Vintage spy terminal.
   Warm putty plastic outer casing with bevel chrome.
   CRT phosphor screen inside. Colorful Carmen-style action
   buttons below the screen. Collapsed: 72px. Expanded: 220px.
   ============================================================ */

const NAV = [{
  id: 'map',
  label: 'Map',
  icon: 'map',
  color: '#41B6E6',
  textDark: false
}, {
  id: 'prediction',
  label: 'Prediction',
  icon: 'prediction',
  color: '#C8A040',
  textDark: true
}, {
  id: 'city',
  label: 'City',
  icon: 'city',
  color: '#4A8A3A',
  textDark: false
}, {
  id: 'bingo',
  label: 'Bingo',
  icon: 'bingo',
  color: '#4A6898',
  textDark: false
}, {
  id: 'nemesis',
  label: 'Nemesis',
  icon: 'nemesis',
  color: '#8B3A2A',
  textDark: false
}];

/* CRT scanlines — subtle horizontal line overlay */
const CRT_SCANLINES = 'repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.22) 1px, rgba(0,0,0,0.22) 2px)';
function Sidebar({
  active = 'map',
  onNavigate,
  avatar,
  items = NAV,
  forceExpanded = false
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  const [hover, setHover] = React.useState(false);
  const expanded = forceExpanded || hover;

  /* Putty casing bevel */
  const casingBevel = 'var(--casing-hi) var(--casing-lo) var(--casing-lo) var(--casing-hi)';
  const casingInset = 'var(--casing-lo) var(--casing-hi) var(--casing-hi) var(--casing-lo)';
  return /*#__PURE__*/React.createElement("nav", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: expanded ? 220 : 72,
      height: '100%',
      flex: 'none',
      /* Warm putty plastic outer casing */
      background: 'var(--casing)',
      border: '3px solid',
      borderColor: casingBevel,
      display: 'flex',
      flexDirection: 'column',
      padding: 10,
      gap: 8,
      transition: 'width var(--dur-base) var(--ease-out)',
      overflow: 'hidden',
      zIndex: 'var(--z-nav)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--casing-mid)',
      border: '2px solid',
      borderColor: casingInset,
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minHeight: 28,
      overflow: 'hidden',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 9,
      color: '#3A2810',
      letterSpacing: '0.04em',
      flex: 'none',
      lineHeight: 1.4
    }
  }, "S"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 8,
      color: '#3A2810',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      lineHeight: 1.4,
      opacity: expanded ? 1 : 0,
      transition: 'opacity var(--dur-fast)'
    }
  }, "SELENA'S CHASE")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--crt-bg)',
      backgroundImage: CRT_SCANLINES,
      border: '3px solid',
      /* Deeply inset — the screen sits inside the plastic */
      borderColor: 'var(--casing-lo) var(--casing-hi) var(--casing-hi) var(--casing-lo)',
      padding: '8px 6px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      overflow: 'hidden',
      position: 'relative'
    }
  }, expanded && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 7,
      color: 'var(--crt-dim)',
      letterSpacing: '0.05em',
      marginBottom: 5,
      paddingBottom: 4,
      borderBottom: '1px solid #1A4A1A',
      whiteSpace: 'nowrap'
    }
  }, "TRACKER CONSOLE"), items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onNavigate && onNavigate(it.id),
      title: !expanded ? it.label : undefined,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: 30,
        padding: '0 4px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        background: on ? 'var(--crt-row)' : 'transparent',
        color: on ? 'var(--crt-hi)' : 'var(--crt-dim)',
        textAlign: 'left',
        transition: 'color var(--dur-fast)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.color = '#2ABF2A';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.color = 'var(--crt-dim)';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 8,
        color: on ? 'var(--crt-hi)' : 'transparent',
        flex: 'none',
        width: 10,
        lineHeight: 1
      }
    }, '>'), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 'none',
        display: 'grid',
        placeItems: 'center',
        width: 20
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 18,
      strokeWidth: on ? 2.2 : 1.8
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 8,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        opacity: expanded ? 1 : 0,
        transition: 'opacity var(--dur-fast)'
      }
    }, it.label));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: expanded ? 'row' : 'column',
      gap: 4,
      alignItems: 'center',
      justifyContent: expanded ? 'flex-start' : 'center'
    }
  }, items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: `btn-${it.id}`,
      onClick: () => onNavigate && onNavigate(it.id),
      title: it.label,
      style: {
        width: expanded ? 34 : 48,
        height: expanded ? 26 : 36,
        background: it.color,
        border: '2px solid',
        /* Bevel: active = pressed in, inactive = raised */
        borderColor: on ? '#606060 #D0D0D0 #D0D0D0 #606060' : '#D0D0D0 #606060 #606060 #D0D0D0',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        flex: 'none',
        padding: 0,
        opacity: on ? 1 : 0.7,
        transition: 'opacity var(--dur-fast), border-color var(--dur-fast)'
      },
      onMouseEnter: e => {
        e.currentTarget.style.opacity = '1';
      },
      onMouseLeave: e => {
        e.currentTarget.style.opacity = on ? '1' : '0.7';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: expanded ? 13 : 20,
      strokeWidth: 2,
      color: it.textDark ? '#3A2810' : '#FFFFFF'
    }));
  })), avatar && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      paddingTop: 6,
      borderTop: '1px solid var(--casing-mid)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '2px solid',
      borderColor: casingBevel,
      flex: 'none'
    }
  }, avatar), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 8,
      color: '#3A2810',
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
      opacity: expanded ? 1 : 0,
      transition: 'opacity var(--dur-fast)'
    }
  }, "TRACKER")));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
const React = window.React;

/* ============================================================
   TabBar v2 — Vintage detective game action bar.
   Carmen Sandiego-inspired bottom navigation.
   Bevel top border. Hard dividers. Press Start 2P labels.
   ============================================================ */

const NAV = [{
  id: 'map',
  label: 'Map',
  icon: 'map'
}, {
  id: 'prediction',
  label: 'Predict',
  icon: 'prediction'
}, {
  id: 'city',
  label: 'City',
  icon: 'city'
}, {
  id: 'bingo',
  label: 'Bingo',
  icon: 'bingo'
}, {
  id: 'nemesis',
  label: 'Nemesis',
  icon: 'nemesis'
}];
function TabBar({
  active = 'map',
  onNavigate,
  items = NAV,
  style
}) {
  const {
    Icon
  } = window.DesignSystem_19034b;
  return /*#__PURE__*/React.createElement("nav", {
    role: "navigation",
    style: {
      display: 'flex',
      alignItems: 'stretch',
      width: '100%',
      height: 'var(--tabbar-height)',
      paddingBottom: 'var(--safe-bottom)',
      background: 'var(--mahogany)',
      /* Hard bevel top edge — the shelf that the game world sits above */
      borderTop: '3px solid var(--bevel-hi)',
      borderBottom: '2px solid var(--bevel-lo)',
      zIndex: 'var(--z-nav)',
      ...style
    }
  }, items.map((it, idx) => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onNavigate && onNavigate(it.id),
      "aria-current": on ? 'page' : undefined,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 'var(--touch-min)',
        /* Active tab recesses inward */
        background: on ? 'var(--felt)' : 'transparent',
        /* Selena-blue top stripe on active tab */
        borderTop: on ? '2px solid var(--selena)' : '2px solid transparent',
        /* Hard dividers between tabs */
        borderRight: idx < items.length - 1 ? '1px solid var(--walnut)' : 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        color: on ? 'var(--selena)' : 'var(--dust)',
        cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast)',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        padding: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 22,
      strokeWidth: on ? 2.2 : 1.8
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 8,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1,
        /* Clamp long labels */
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: '0 4px'
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/selenas-chase/AppShell.jsx
try { (() => {
const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   AppShell — responsive frame. Desktop = sidebar; mobile = tab bar.
   Switches `screen` and renders the matching view.
   ============================================================ */

const TITLES = {
  map: 'World Map',
  prediction: 'Prediction',
  city: 'City',
  bingo: 'Bingo',
  nemesis: 'Nemesis'
};
function useIsMobile(bp = 900) {
  const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    const onR = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, [bp]);
  return m;
}
function AppShell({
  screen,
  onNavigate,
  children,
  countdownHours = 56
}) {
  const {
    Sidebar,
    TabBar,
    Avatar,
    CountdownPill,
    Badge
  } = DS;
  const mobile = useIsMobile();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100%',
      width: '100%',
      background: 'var(--navy)',
      overflow: 'hidden'
    }
  }, !mobile && /*#__PURE__*/React.createElement(Sidebar, {
    active: screen,
    onNavigate: onNavigate,
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      size: 40,
      colorway: "chicago"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: mobile ? '14px 16px' : '18px 28px',
      flex: 'none',
      borderBottom: '1px solid var(--hairline)',
      background: 'var(--navy)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: mobile ? 24 : 30,
      textTransform: 'uppercase',
      letterSpacing: '0.01em',
      color: 'var(--cream)'
    }
  }, TITLES[screen]), !mobile && /*#__PURE__*/React.createElement(Badge, {
    tone: "blue",
    icon: "globe"
  }, "Lakefront Steppers")), /*#__PURE__*/React.createElement(CountdownPill, {
    hoursLeft: countdownHours
  })), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: mobile ? '16px' : '28px',
      paddingBottom: mobile ? 'calc(var(--tabbar-height) + 24px)' : 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto'
    }
  }, children))), mobile && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement(TabBar, {
    active: screen,
    onNavigate: onNavigate
  })));
}
Object.assign(window, {
  AppShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/selenas-chase/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/selenas-chase/BingoScreen.jsx
try { (() => {
const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   BingoScreen — 5×5 weekly habit bingo card.
   ============================================================ */

const TASKS = [['10k steps', 'step'], ['Morning walk', 'workout'], ['8h sleep', 'sleep'], ['Hit target', 'flame'], ['Log a workout', 'workout'], ['Beat nemesis', 'nemesis'], ['Sync before noon', 'sync'], ['Walk a landmark', 'city'], ['Streak day', 'flame'], ['7am steps', 'clock'], ['Stairs', 'step'], ['Group chat', 'heart'], ['FREE', 'star'], ['New PR', 'trophy'], ['Lunch walk', 'workout'], ['Predict steps', 'prediction'], ['Heart zone', 'heart'], ['Evening walk', 'workout'], ['Unlock badge', 'badge'], ['12k steps', 'step'], ['Weekend hike', 'map'], ['Early bird', 'clock'], ['Double target', 'flame'], ['No-zero day', 'step'], ['Close the ring', 'globe']];

// mixed states; winning middle row highlighted
const STATES = ['complete', 'incomplete', 'progress', 'complete', 'incomplete', 'incomplete', 'complete', 'incomplete', 'progress', 'incomplete', 'win', 'win', 'free', 'win', 'win', 'progress', 'incomplete', 'complete', 'incomplete', 'complete', 'complete', 'incomplete', 'progress', 'incomplete', 'complete'];
function BingoScreen() {
  const done = STATES.filter(s => s === 'complete' || s === 'win' || s === 'free').length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(DS.Card, {
    variant: "elevated",
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--blue)'
    }
  }, "Week 14 \xB7 Tokyo"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '4px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 30,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, "Habit Bingo")), /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "gold",
    icon: "check",
    solid: true
  }, "1 line \u2014 bonus unlocked!"), /*#__PURE__*/React.createElement(DS.StatCard, {
    icon: "badge",
    label: "Squares",
    value: `${done}/25`,
    accent: "var(--gold)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 8
    }
  }, STATES.map((s, i) => /*#__PURE__*/React.createElement(DS.BingoTile, {
    key: i,
    label: TASKS[i][0],
    icon: TASKS[i][1],
    state: s === 'win' ? 'complete' : s,
    highlight: s === 'win'
  })))));
}
Object.assign(window, {
  BingoScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/selenas-chase/BingoScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/selenas-chase/CityScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   CityScreen — landmark grid (3 / 2 / 2) + city header + badges.
   ============================================================ */

const LANDMARKS = [{
  name: 'Senso-ji',
  fact: "Tokyo's oldest temple, founded 645 AD.",
  state: 'unlocked',
  color: 'var(--map-land-warm)',
  icon: 'city'
}, {
  name: 'Tokyo Tower',
  fact: 'Taller than the Eiffel Tower it was modeled on.',
  state: 'unlocked',
  color: 'var(--red)',
  icon: 'city'
}, {
  name: "Today's landmark",
  state: 'today',
  icon: 'star'
}, {
  name: 'Shibuya',
  fact: 'The busiest pedestrian crossing on Earth.',
  state: 'unlocked',
  color: 'var(--map-land-teal)',
  icon: 'map'
}, {
  state: 'locked'
}, {
  name: 'Meiji Shrine',
  fact: '100,000 trees donated from across Japan.',
  state: 'unlocked',
  color: 'var(--map-land-sage)',
  icon: 'globe'
}, {
  state: 'locked'
}];
function CityScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(DS.Card, {
    variant: "elevated",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(DS.CityBadge, {
    name: "Tokyo",
    quality: "gold",
    size: 80
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--blue)'
    }
  }, "City 4 of 12 \xB7 Unlocked"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '4px 0 6px',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 40,
      textTransform: 'uppercase',
      color: 'var(--cream)',
      lineHeight: 1
    }
  }, "Tokyo"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--muted)'
    }
  }, "4 of 7 landmarks discovered. Walk to reveal the rest before Selena flees to Sydney.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(DS.StatCard, {
    icon: "badge",
    label: "Landmarks",
    value: "4/7",
    accent: "var(--gold)"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 12px',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 22,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, "Landmarks"), /*#__PURE__*/React.createElement("div", {
    className: "sc-landmark-grid"
  }, LANDMARKS.map((l, i) => /*#__PURE__*/React.createElement(DS.LandmarkTile, _extends({
    key: i
  }, l))))), /*#__PURE__*/React.createElement("style", null, `
        .sc-landmark-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .sc-landmark-grid > *:nth-child(4), .sc-landmark-grid > *:nth-child(5) { grid-column: span 1; }
        @media (max-width: 720px){ .sc-landmark-grid{ grid-template-columns:repeat(2,1fr);} }
      `));
}
Object.assign(window, {
  CityScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/selenas-chase/CityScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/selenas-chase/MapScreen.jsx
try { (() => {
const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   MapScreen — illustrated world map + group progress + leaderboard.
   ============================================================ */

const PLAYERS = [{
  id: 'm',
  name: 'Maya',
  steps: 61240,
  pct: 78,
  colorway: 'emerald',
  leader: true
}, {
  id: 'y',
  name: 'You',
  steps: 54880,
  pct: 70,
  colorway: 'chicago'
}, {
  id: 'a',
  name: 'Alex',
  steps: 49120,
  pct: 63,
  colorway: 'desert'
}, {
  id: 'j',
  name: 'Jordan',
  steps: 38400,
  pct: 49,
  colorway: 'violet'
}];
function MapScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(window.WorldMap, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(DS.StatCard, {
    icon: "step",
    label: "Group steps",
    value: "203,640"
  }), /*#__PURE__*/React.createElement(DS.StatCard, {
    icon: "globe",
    label: "Cities unlocked",
    value: "4",
    accent: "var(--gold)"
  }), /*#__PURE__*/React.createElement(DS.StatCard, {
    icon: "flame",
    label: "Gap to Selena",
    value: "12k",
    unit: "steps",
    accent: "var(--red)"
  })), /*#__PURE__*/React.createElement(DS.ProgressStrip, {
    from: "Chicago",
    to: "Tokyo",
    players: PLAYERS
  }), /*#__PURE__*/React.createElement(DS.Card, {
    padding: "0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 18px',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 22,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, "Leaderboard"), /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "muted"
  }, "This week")), /*#__PURE__*/React.createElement("div", null, PLAYERS.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 18px',
      borderBottom: i < PLAYERS.length - 1 ? '1px solid var(--hairline)' : 'none',
      background: p.name === 'You' ? 'var(--blue-08)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 15,
      color: 'var(--muted)',
      width: 22
    }
  }, i + 1), /*#__PURE__*/React.createElement(DS.Avatar, {
    size: 36,
    colorway: p.colorway,
    ring: p.leader ? 'var(--gold)' : undefined,
    badge: p.leader ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'grid',
        placeItems: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: 'var(--gold)',
        color: 'var(--navy)'
      }
    }, /*#__PURE__*/React.createElement(DS.Icon, {
      name: "crown",
      size: 11
    })) : undefined
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-body)',
      fontWeight: p.name === 'You' ? 700 : 500,
      fontSize: 15,
      color: 'var(--cream)'
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 16,
      color: p.name === 'You' ? 'var(--blue)' : 'var(--cream)'
    }
  }, p.steps.toLocaleString()))))));
}
Object.assign(window, {
  MapScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/selenas-chase/MapScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/selenas-chase/NemesisScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   NemesisScreen — head-to-head duel + 5-day skyline.
   ============================================================ */

const DAYS = [{
  d: 'Mon',
  you: 9200,
  nem: 7400
}, {
  d: 'Tue',
  you: 6100,
  nem: 8800
}, {
  d: 'Wed',
  you: 8700,
  nem: 8700
}, {
  d: 'Thu',
  you: 11200,
  nem: 9100
}, {
  d: 'Fri',
  you: 4200,
  nem: 3100,
  today: true
}];
function MiniDay({
  d,
  you,
  nem,
  today
}) {
  const max = Math.max(...DAYS.flatMap(x => [x.you, x.nem]));
  const yh = you / max * 100,
    nh = nem / max * 100;
  const youWin = you >= nem;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 4,
      height: 140
    }
  }, /*#__PURE__*/React.createElement("div", {
    title: "You",
    style: {
      width: 16,
      height: `${Math.max(6, yh)}%`,
      background: 'var(--blue)',
      borderRadius: '3px 3px 0 0',
      border: youWin ? '1.5px solid var(--gold)' : '1.5px solid color-mix(in srgb, var(--blue) 70%, var(--navy))',
      animation: today ? 'sc-bounce-up 0.6s var(--ease-spring) both' : 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    title: "Selena",
    style: {
      width: 16,
      height: `${Math.max(6, nh)}%`,
      background: 'var(--red)',
      borderRadius: '3px 3px 0 0',
      border: !youWin ? '1.5px solid var(--gold)' : '1.5px solid color-mix(in srgb, var(--red) 70%, var(--navy))',
      animation: today ? 'sc-bounce-up 0.6s var(--ease-spring) both' : 'none'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: today ? 700 : 500,
      color: today ? 'var(--blue)' : 'var(--muted)'
    }
  }, d));
}
function NemesisScreen() {
  const youTotal = DAYS.reduce((s, x) => s + x.you, 0);
  const nemTotal = DAYS.reduce((s, x) => s + x.nem, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(DS.Card, {
    variant: "elevated",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(DS.Avatar, {
    size: 64,
    colorway: "chicago"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--blue)'
    }
  }, "You"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 28,
      color: 'var(--cream)'
    }
  }, youTotal.toLocaleString()))), /*#__PURE__*/React.createElement(DS.Badge, {
    tone: youTotal >= nemTotal ? 'gold' : 'red',
    icon: youTotal >= nemTotal ? 'crown' : 'nemesis',
    solid: youTotal >= nemTotal
  }, youTotal >= nemTotal ? 'You lead' : 'Down 700'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flexDirection: 'row-reverse'
    }
  }, /*#__PURE__*/React.createElement(DS.Avatar, {
    size: 64,
    colorway: "crimson"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--red)'
    }
  }, "Selena"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 28,
      color: 'var(--cream)'
    }
  }, nemTotal.toLocaleString())))), /*#__PURE__*/React.createElement(DS.Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 22,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, "This week's skyline"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: 'var(--blue)',
      borderRadius: 2
    }
  }), "You"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: 'var(--red)',
      borderRadius: 2
    }
  }), "Selena"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'flex-end'
    }
  }, DAYS.map(x => /*#__PURE__*/React.createElement(MiniDay, _extends({
    key: x.d
  }, x))))));
}
Object.assign(window, {
  NemesisScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/selenas-chase/NemesisScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/selenas-chase/PredictionScreen.jsx
try { (() => {
const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   PredictionScreen — make a weekly prediction + see the group's.
   ============================================================ */

const GUESSES = [{
  id: 'm',
  name: 'Maya',
  colorway: 'emerald',
  val: 51000
}, {
  id: 'a',
  name: 'Alex',
  colorway: 'desert',
  val: 47500
}, {
  id: 'j',
  name: 'Jordan',
  colorway: 'violet',
  val: 44000
}];
function PredictionScreen() {
  const [value, setValue] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) 320px',
      gap: 22,
      alignItems: 'start'
    },
    className: "sc-pred-grid"
  }, /*#__PURE__*/React.createElement(DS.PredictionCard, {
    city: "Tokyo",
    value: value,
    prediction: value || '48,500',
    onChange: e => setValue(e.target.value),
    onSubmit: () => setSubmitted(true),
    submitted: submitted
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(DS.Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 12px',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 20,
      textTransform: 'uppercase',
      color: 'var(--cream)'
    }
  }, "Group guesses"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, GUESSES.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(DS.Avatar, {
    size: 28,
    colorway: g.colorway
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 14,
      color: 'var(--cream)'
    }
  }, g.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      color: 'var(--blue)'
    }
  }, g.val.toLocaleString()))))), /*#__PURE__*/React.createElement(DS.StatCard, {
    icon: "trophy",
    label: "Closest last week",
    value: "Maya",
    accent: "var(--gold)"
  })), /*#__PURE__*/React.createElement("style", null, `@media (max-width: 760px){ .sc-pred-grid{ grid-template-columns: 1fr !important; } }`));
}
Object.assign(window, {
  PredictionScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/selenas-chase/PredictionScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/selenas-chase/WorldMap.jsx
try { (() => {
const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   WorldMap — real-world continent accuracy with travel overlay.
   Uses your provided SVG landmass paths + our pin/route system.
   ============================================================ */

const CITIES = [{
  id: 'chicago',
  name: 'Chicago',
  x: 24,
  y: 38,
  variant: 'current'
}, {
  id: 'lima',
  name: 'Lima',
  x: 30,
  y: 70,
  variant: 'visited'
}, {
  id: 'cairo',
  name: 'Cairo',
  x: 55,
  y: 46,
  variant: 'visited'
}, {
  id: 'oslo',
  name: 'Oslo',
  x: 52,
  y: 24,
  variant: 'visited'
}, {
  id: 'tokyo',
  name: 'Tokyo',
  x: 85,
  y: 40,
  variant: 'next',
  selena: true
}];
function WorldMap({
  cities = CITIES,
  style
}) {
  const {
    MapPin
  } = DS;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      borderRadius: 'var(--r-card)',
      overflow: 'hidden',
      border: '1px solid var(--hairline)',
      boxShadow: 'var(--shadow-card)',
      aspectRatio: '16 / 9',
      minHeight: 280,
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 1000 562",
    preserveAspectRatio: "xMidYMid slice",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "oceanGradient",
    gradientUnits: "userSpaceOnUse",
    cx: "500",
    cy: "281",
    r: "690"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "var(--map-ocean-2, #315f70)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "var(--map-ocean, #203f51)"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "dotPattern",
    width: "28",
    height: "28",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "5",
    r: "1.25",
    fill: "rgba(240,232,220,0.045)"
  }))), /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "562",
    fill: "url(#oceanGradient)"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "1000",
    height: "562",
    fill: "url(#dotPattern)"
  }), /*#__PURE__*/React.createElement("g", {
    id: "ocean-grid"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 460.8H1000",
    stroke: "rgba(240,232,220,0.04)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 354.7H1000",
    stroke: "rgba(240,232,220,0.12)",
    strokeWidth: "1",
    strokeDasharray: "6 10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 248.7H1000",
    stroke: "rgba(240,232,220,0.04)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 142.6H1000",
    stroke: "rgba(240,232,220,0.04)",
    strokeWidth: "1"
  }), [14.2, 92.3, 170.5, 248.7, 326.8, 405, 483.2, 561.3, 639.5, 717.7, 795.8, 874, 952.2].map(x => /*#__PURE__*/React.createElement("line", {
    key: x,
    x1: x,
    y1: "0",
    x2: x,
    y2: "562",
    stroke: "rgba(240,232,220,0.04)",
    strokeWidth: "1"
  }))), /*#__PURE__*/React.createElement("g", {
    id: "landmasses"
  }, /*#__PURE__*/React.createElement("path", {
    id: "north-america",
    fill: "var(--map-land-green, #7f9b6d)",
    stroke: "rgba(6,16,29,0.38)",
    strokeWidth: "2.5",
    d: "M14.2 110.8 L21.9 113.8 L22.2 114.5 L26.5 115.5 L27.9 116.8 L27.4 117.6 L28 118.8 L27.4 119.3 L28.6 119.5 L28.7 120.4 L29.8 119.8 L29.9 120.9 L30.2 119.7 L29.1 119.6 L30 119 L29.8 117.9 L28.2 117.7 L35.9 118.1 L37.3 119.4 L41.1 121.1 L39.1 121.6 L38.5 122.8 L36.4 122 L37.5 123.3 L32.4 122.4 L34.8 123.2 L34.7 124.8 L31.8 125.8 L32.6 125.5 L33 125.7 L32.4 126.4 L34.4 127 L32.5 126.7 L32.6 127.6 L31.4 127.4 L32 126.9 L31.5 126.3 L31.7 126.9 L30.7 127.3 L27.7 125.7 L26 125.8 L24.8 124.9 L25.3 124.4 L24.5 123.3 L22 122.8 L18.2 123.3 L18.3 122.4 L16.9 121.3 L18.1 121 L18 120.1 L17 120.9 L16.6 120.1 L15.8 120.3 L15.8 121 L15 120.8 L14.7 121.6 L16 123.1 L14.2 124.8 Z M274.8 321.8 L274.5 322.8 L275 322.3 L275.8 323.3 L273.4 326.1 L274.7 328.3 L272.4 329.3 L272 326.7 L271.5 327.8 L271 327.6 L270.1 325.7 L269.1 325.9 L268.9 325.2 L267.3 325.4 L267.2 326.3 L266.6 324.3 L265.6 323.9 L266.2 325.1 L265.4 324.9 L265.3 322.8 L262.7 320.9 L262.4 319.5 L260.9 318.4 L262 320 L261.4 320.9 L259.9 319.7 L259.4 318.1 L260 316.6 L259.2 316.2 L259.9 315.6 L254.7 309.1 L255 308.5 L255.7 309 L255.4 307.3 L254.3 307.2 L254.1 308.2 L252 307.8 L252.6 308.2 L247.3 305.6 L245.3 305.4 L237.4 297.7 L235.2 297.5 L231.6 299.4 L219.8 293.7 L217.5 291.2 L213.5 290 L212.6 288.3 L209.5 286.2 L208.2 283.9 L207.8 282.6 L208.9 282 L208.2 281.3 L209.1 278.9 L207 273.8 L203.3 269 L204 269.4 L202.3 268.1 L203.1 268.7 L203 268 L201.8 267.6 L201.6 266.1 L198.1 263.9 L198.1 262.6 L198.9 261.8 L198 260.3 L197 260.1 L196.6 258.9 L195.2 258.2 L195.2 256.2 L193.7 256 L190.9 252.3 L188.5 246.3 L188.4 244.4 L183.6 242 L184.6 248.6 L189.1 254.2 L189.3 256.2 L191.4 258.9 L191.9 260.9 L191.7 259.7 L192.5 260.3 L193.1 263.6 L194.7 266.6 L194.8 268.6 L195.5 269.5 L195.8 268.6 L197 269.7 L198 271.8 L197.7 273 L196.5 273.8 L195.7 271.4 L191.8 268.1 L191.4 266.8 L191.1 267.3 L191.1 266.3 L190.9 267 L191.3 264.6 L190.7 262.3 L189 262 L189.5 260.8 L188.9 261 L189.2 259.8 L188.5 259.6 L188.7 258.4 L187.1 258.8 L187.9 257.6 L187.2 257.9 L187.4 256.9 L185.9 257.2 L186.8 256.1 L186.1 256.3 L186.3 255.3 L184.8 255.6 L185.6 254.5 L184.9 254.7 L185.2 253.7 L183.7 254 L184.5 252.9 Z"
  }), /*#__PURE__*/React.createElement("path", {
    id: "south-america",
    fill: "var(--map-land-warm, #c48f5a)",
    stroke: "rgba(6,16,29,0.38)",
    strokeWidth: "2.5",
    d: "M292 542.1 L292.5 541.8 L291.5 541.5 L292.4 541.4 L293.2 540.3 L292.4 540 L292.3 541 L291.9 540.6 L291.1 541.4 L291.8 540.4 L291 538.7 L292.1 539.4 L293 538.9 L293 539.9 L293.5 538.5 L294.1 539.4 L293.2 540.2 L294.1 539.8 L293.8 538.5 L294.3 537.8 L292.6 536.9 L293.1 535.6 L291.8 536.7 L294.1 537.7 L293.4 538 L292.1 537 L292.9 537.8 L292.4 538.3 L293.1 538.1 L292.6 539 L291.9 537.3 L292.2 539.2 L291.3 538.1 L292 538.7 L291.7 537.5 L291.1 537.8 L290.5 537.3 L290.6 536.3 L291.4 537.2 L291.2 535.4 L290.1 535.8 L289.7 534.8 L290.9 534.9 L291 533.8 L292.1 533.9 L291 533.5 L291.5 532.9 L290.2 534.5 L289.6 533.2 L290.7 533.5 L289.9 533 L290.4 532.8 L289.7 533.1 L289.6 532.4 L289.4 532.9 L288.5 532.2 L289.2 531.6 L290.7 532.6 L289.4 531.5 L290.7 531.7 L290.8 530.9 L289.7 531.2 L290.3 530.5 L289.5 530.2 L290.6 529.9 L291.3 530.5 L290.1 529.8 L290.3 528.9 L290.9 529.4 L290.2 528.6 L289.9 529.9 L289.3 529.4 L289.2 527.3 L290.2 527.1 L289.3 526.6 L290.5 526.6 L290.8 525.9 L288.6 524.5 L289.5 524.5 L289.6 525.4 L290 524.4 L291.9 525.4 L292.2 524.7 L291.9 525.2 L291.2 524.1 L292.4 524.5 L291.5 524.3 L291 523.1 L290.5 524 L288.4 523.4 L289 522.8 L288.8 523.3 L290 523.5 L289.6 523.1 L290.6 522.7 L289.6 523 L290.1 522.4 L289 522.5 L289.5 521.6 L290.1 522.3 L290 521.6 L290.5 521.6 L289.8 520 L288.1 520.2 L288.1 518.9 L286.4 519.9 L287 520.7 L286.1 519.9 L287.3 518.5 L288.1 518.7 L287.6 518.2 L288.9 517.5 L288.6 517 L287.7 517.8 L288.1 517.4 L287.5 516.9 L288.4 516.7 L289.2 517.5 L289.2 516.7 L290.1 516.7 L289.6 517.5 L290.2 517.7 L289.5 517.8 L290.3 517.3 L290.4 517.9 L289.1 518.1 L290.8 518.6 L290.7 517.9 L290.6 519.3 L291.3 519.3 L291 518.8 L291.9 518.5 L292.1 517.5 L291.2 518.5 L291.3 517.3 L292.6 516.1 L291.5 516.6 L291.7 515.4 L292.4 514.8 L293.5 515.3 L291.6 514.5 L294.1 512.1 L294.1 511.4 L293.8 512.1 L292.2 510.9 L293 509.5 L293.6 509.7 L293.4 509.1 L292.8 509.4 L293.3 509.1 L292.7 508.4 L293.4 507.3 L293.8 505.4 L293.1 502.3 L295.6 497.9 L295.5 497.2 L294.8 495 L295 492.3 L294.7 490.1 L294.9 485.4 L294.2 480.7 L293.5 478.4 L295.4 477.6 L295.2 475.5 L294.1 475 L294.8 472.8 L294.5 470.1 L295.1 468.5 L294.1 466.2 L294.3 463.8 L293.8 461.2 L292.9 459.5 L293.2 457.1 L292.4 454.7 L291.5 453 L291.8 450.5 L291.2 448.1 L291.9 445.8 L291.1 443.5 L291.7 441.1 L291 438.8 L291.5 436.5 L290.8 434.2 L291.2 431.9 L290.5 429.6 L290.8 427.3 L290.2 425 L290.5 422.7 L289.8 420.4 L290.1 418.1 L289.5 415.8 L289.8 413.5 L289.2 411.2 L289.5 408.9 L288.9 406.6 L289.2 404.3 Z"
  }), /*#__PURE__*/React.createElement("path", {
    id: "europe-islands",
    fill: "var(--map-land-sage, #a4aa78)",
    stroke: "rgba(6,16,29,0.38)",
    strokeWidth: "2.5",
    d: "M483.2 175.2 L481.1 175.4 L479.3 174.7 L479.7 175.2 L476.8 176.1 L475.9 175.4 L474.1 175.5 L473.7 177.2 L472.2 176.6 L469.8 177.2 L469.6 178.1 L468.3 177.7 L470.5 176.1 L471.4 174.3 L472.6 174.1 L472.1 173.8 L475.2 173.8 L477 171.6 L474.3 173.1 L473.2 172.2 L471.9 172.4 L472.5 172.1 L471.9 171.6 L470.3 172.3 L469.3 171.4 L472.2 170 L472.9 168.9 L472.6 167.6 L470.7 168.1 L472.2 166.6 L476.2 166.1 L475.1 165.4 L475.8 164.8 L475.2 164.4 L475.9 163 L474.9 163.6 L473.7 162 L475.2 160.3 L473.8 160.3 L472.8 161.1 L471.7 160.6 L471.7 161.4 L470.5 160.7 L470.5 161.6 L469.8 160.8 L471.1 158.5 L470.4 156.9 L471.6 157.1 L470.5 156.8 L470.8 156 L470.2 157.2 L469.8 156.7 L469.2 157.1 L470.2 155.9 L469 156.6 L468.8 159 L468 159.2 L469 157.3 L468.5 157.6 L468.7 156.6 L468.3 156.9 L468.6 155.6 L470.1 154.2 L469.3 153.7 L469.8 153.8 L468.3 155 L467.5 154.5 L468.7 154.3 L466.9 154.2 L468.2 154 L468 153.2 L468.8 153.2 L468.3 152.8 L469.1 152.8 L468.2 152.2 L469 151.7 L468 151.9 L467.9 151.2 L468.8 151.3 L468 150.2 L469.9 150.3 L468.9 149.4 L469.5 149.1 L469.1 148.7 L470.3 148.8 L469.7 148.4 L470.1 147.5 L471.5 148.1 L475.3 147.4 L474.8 148.6 L472.7 150.2 L471.8 150.1 L473.3 150.2 L471.6 151.5 L474.4 150.6 L478.4 151.1 L476.5 154.7 L474.4 155.4 L475.8 155.2 L476.4 155.8 L474.3 156.7 L473.2 156.4 L475.2 156.9 L476.2 156.5 L478.9 158.2 L480 161.8 L481.7 162.1 L483 163.4 L483.4 165.3 L481.1 164.9 L483.6 165.7 L484 167 L483.1 167.8 L484.1 168.1 L485.7 167.4 L487.6 168.3 L487.3 170.6 L485 171.9 L485.6 171.8 L485.2 172.6 L483.8 172.8 L486.9 173 L486.8 173.9 Z M462.3 171.4 L461.1 171.2 L461.6 171.6 L460.9 172.3 L457.7 172.9 L458.5 171.8 L456.7 172.3 L458.3 171.3 L456 171.4 L457.7 170.3 L455.9 170.6 L456.2 170.1 L457.8 170 L457.2 169.4 L458.1 168.8 L460.5 168.6 L459.8 168.1 L457.3 168.9 L459 166.8 L460 166.6 L456.6 165.9 L456.6 165.4 L458 165.2 L457.3 164.7 L458.3 164.5 L457.2 164.3 L457.5 163.6 Z"
  }), /*#__PURE__*/React.createElement("path", {
    id: "africa",
    fill: "var(--map-land-tan, #c9ad7a)",
    stroke: "rgba(6,16,29,0.38)",
    strokeWidth: "2.5",
    d: "M567.3 244.4 L567.3 247.5 L568.1 248.8 L567.4 250.1 L568.2 252.3 L570.7 256.3 L571.6 260.4 L574.7 268.1 L576.4 270.2 L575.6 270.1 L576.1 273.6 L579.3 276.7 L579.5 279.1 L580.4 280.3 L579.9 279.7 L580.6 288 L583.6 290.9 L586.6 301.4 L587.1 299.9 L587.9 301.9 L588.8 301.6 L590.5 303 L596.1 310.6 L596.2 312.3 L594 314 L595.6 313.7 L597.5 316.8 L599.3 318 L602.5 316.3 L604.2 317 L606.7 315.2 L611.9 314.6 L614.1 313.8 L615.5 312.4 L616.8 312.9 L616.1 317.9 L616.5 317.4 L617.1 317.8 L615.8 318.3 L615.6 321.4 L608.1 338.9 L603 346.1 L596.7 352.2 L592 358.8 L590.8 361.7 L590 362 L590.1 361.3 L589.8 362.1 L589.4 361.6 L590 362.7 L587.9 364.4 L587.7 366.4 L585.3 371.3 L584.2 376.1 L586.2 379.5 L585.3 382.5 L585.9 382.3 L585.4 384 L586.6 390.2 L588.4 391.1 L589.1 392.5 L588.2 394.7 L589.1 399.8 L588.4 400.4 L588.7 401 L588.9 400.6 L588.7 404.8 L589.3 404.9 L589.6 407.2 L589 407.3 L589.4 407.7 L588.7 408.2 L588.8 409.6 L586.7 412.3 L587 412.8 L585.4 413.8 L585 414.9 L582.3 415.5 L579.5 418.4 L579.2 417.9 L579.5 418.6 L577.8 421.5 L576.6 421.7 L574.1 424.9 L573.4 424.2 L573.5 427.4 L574.7 428.7 L575.2 433.2 L575.6 432.8 L575.7 433.6 L575.8 433.1 L575.4 440.5 L574.6 441.8 L569.7 444.2 L567.8 446.5 L568.7 447.7 L569.1 446.9 L567.5 455.7 L564.6 458.9 L561.4 465.4 L555.9 471.5 L552.1 474.1 L550.5 473.9 L550.1 475 L548.3 474.8 L547.9 475.7 L541.9 474.9 L540 476.2 L536.7 476.6 L535.3 477.9 L533.4 477.1 L533 476 L532.2 476.3 L532.1 475.2 L531 475.9 L531.2 473.8 L529.7 470.8 L530.9 469.7 L530.6 466.7 L528.2 462 L527 457.6 L523 451.3 L520.8 439.7 L520.9 434.4 L513.9 418.3 L513.8 410.7 L514.8 408.4 L515.8 402.2 L518.7 398 L519.3 393.6 L517 386.9 L518.1 385.7 L518.1 384.4 L515.1 376.4 L516.2 376 L515.6 376.1 L514.9 375 L513.7 370.5 L508.2 363.2 L505.8 357.1 L506.2 357.7 L506.9 357.3 L507.5 353.5 L507.9 354.5 L509.2 354.1 L507.4 352.9 L507.9 352.4 L508.3 353.1 L508.4 350.9 L507.5 350.6 L508.7 347.9 L509.2 348.4 L509.7 347.8 L509.1 347.1 L509.6 346.3 L508.9 345.9 L509.4 345.1 L508.8 344.7 L509.2 343.9 L508.6 343.6 L509 342.8 L508.3 342.4 L508.8 341.6 L508.1 341.2 L507.9 340.1 L508.7 340 L507.5 339.5 L506.5 340.2 L505.5 339.8 L504.5 340.5 L503.5 340.1 L502.5 340.8 L501.5 340.4 L500.5 341.1 L499.5 340.7 L498.5 341.4 Z"
  }), /*#__PURE__*/React.createElement("path", {
    id: "eurasia",
    fill: "var(--map-land-teal, #5f9a91)",
    stroke: "rgba(6,16,29,0.38)",
    strokeWidth: "2.5",
    d: "M952.2 124.8 L948.4 126.5 L949.2 126.1 L946.2 126 L945.4 125.6 L945.7 125.2 L944.5 125.8 L941.9 125.1 L939.5 125.9 L941.9 125.3 L942.9 126 L941.9 126.9 L945.3 125.8 L946.5 127.6 L947.5 127.8 L947.6 126.9 L948.6 128.4 L947.5 128.7 L948.7 128.4 L948.9 129.1 L948.6 130.6 L949.3 130.5 L949 129.9 L951.2 133 L949.9 134.5 L944.6 133.6 L938.2 135.6 L938.1 136.2 L936.7 136.1 L936.1 136.8 L935.3 136.4 L934.6 137.5 L933.2 137.6 L933.8 138.1 L932.2 138.3 L932.4 139 L931.4 138.8 L931.5 139.7 L927.5 141.1 L927.9 141.5 L926.9 142.9 L924.2 140.4 L918.4 141.2 L916.4 143.3 L915.9 143.3 L916.4 140.9 L913.2 142.2 L913.7 142.6 L912.7 143.4 L911.7 142.2 L911 143.1 L911 142.6 L909.5 142.6 L910 142.7 L908.2 144.4 L908.8 144.9 L908.1 145.3 L908.5 145.9 L908 145.5 L908 146.3 L905.8 147.5 L905 149.8 L906.5 150.5 L906.2 150.8 L907.1 149.8 L908.7 150.6 L907 152 L907.3 154 L908.5 154.1 L908.8 156.1 L908 156.7 L906.8 155.9 L905.5 156.4 L904.6 159 L905.6 161.2 L904.5 162.1 L902.3 161.9 L900 163.3 L900 165.6 L899.5 165.6 L900.2 167 L899.6 166.4 L896.7 167.8 L895.9 167.4 L896.5 167.7 L895.8 168.6 L896.3 169.9 L891.4 174.9 L890.9 169.1 L890 168 L888.5 159.7 L889.6 154.3 L892 152.2 L891.8 150.4 L895.7 149.8 L901.3 144.2 L905 141.9 L905.1 141.1 L909.9 139.7 L909.1 139.1 L910.5 137.9 L909.8 137.5 L910.6 136.6 L910.9 134.6 L913.9 133.9 L911.5 133.1 L908.6 133.7 L908.8 134.3 L908.1 134.8 L907.8 136.2 L908.7 136.7 L907.9 137.3 L907.4 136.5 L906.3 136.7 L902.1 140.1 L900.5 140.6 L901.2 139 L899.5 139.3 L900.1 138.7 L899.5 138.2 L900.8 137.1 L901.1 135.7 L899 136.8 L898 135.8 L892.4 136.8 L891.4 137.2 L891.3 138.4 L889.5 139.3 L889.4 140.1 L885 143.1 L885.4 144.1 L885 143.8 L884.8 144.5 L887 144.4 L887.5 145.5 L884.5 146 L883 145.3 L881.6 146.5 L880.1 145.9 L877.5 146.7 L876.9 145.8 L880 145.3 L878.5 145.1 L877.7 144 L876 144.6 L872.9 143.5 L871.5 143.8 L872 144.5 L870.7 144.5 L871.2 145.3 L869.5 144.7 L867.6 145.3 L864.2 144.8 L860.3 142 L861.2 140.1 L859.8 140.9 L860.3 139.8 L858.9 140.6 L859.4 139.5 L858 140.3 L858.5 139.2 L857.1 140 L857.6 138.9 L856.2 139.7 L856.7 138.6 L855.3 139.4 L855.8 138.3 L854.4 139.1 L854.9 138 L853.5 138.8 L854 137.7 L852.6 138.5 L853.1 137.4 L851.7 138.2 L852.2 137.1 L850.8 137.9 L851.3 136.8 L849.9 137.6 L850.4 136.5 L849 137.3 L849.5 136.2 L848.1 137 L848.6 135.9 L847.2 136.7 L847.7 135.6 L846.3 136.4 L846.8 135.3 L845.4 136.1 L845.9 135 L844.5 135.8 L845 134.7 L843.6 135.5 L844.1 134.4 Z"
  }), /*#__PURE__*/React.createElement("path", {
    id: "greenland-arctic",
    fill: "var(--map-land-sage, #a4aa78)",
    stroke: "rgba(6,16,29,0.38)",
    strokeWidth: "2.5",
    d: "M366.7 142.6 L365.6 142.4 L367.1 141.7 L366.6 141.6 L367.3 140.7 L365.4 142.1 L366.9 140.1 L365.4 141.2 L365.7 140.4 L364.6 141 L365.3 139.9 L364.5 141 L364.2 140.4 L363.3 140.6 L365.4 139.4 L364.9 139.1 L364.1 139.9 L362.7 140 L365.4 138.4 L364.9 138.8 L364.6 138.2 L364.6 138.8 L363.2 139.4 L364.3 138.6 L363.9 137.9 L363 138.2 L363.8 138.6 L362.8 139.2 L358.2 139.6 L359 139.1 L358.3 139.1 L358.7 138.4 L357.5 138.4 L358.3 137.9 L356.8 138.5 L356.5 138.2 L357.3 137.8 L355.3 137.7 L357.1 136.9 L354.8 137.2 L356.5 136.8 L355 136.6 L356 135.6 L354.8 136.6 L354.9 135.9 L354.2 136.2 L355.9 135.3 L355.3 135.3 L355.5 134.9 L353.6 135.7 L354.8 134.9 L353.6 135 L354.8 134.6 L353.3 134.7 L353.9 133.9 L352.9 134.4 L352.1 133.8 L353.2 132.6 L352.2 133.1 L352.5 132.2 L353.7 131.8 L351.9 132.8 L352.5 132 L351.2 131.7 L352.7 131.2 L350.2 131.5 L350 130.8 L352.5 130.7 L349.7 130.7 L350.9 130.2 L349.9 129.8 L351.6 129.7 L349.2 130.1 L349.7 129.7 L348.8 129.4 L350.5 128.7 L349.1 129.2 L349.4 128.6 L348.6 128.4 L352.6 127.8 L351.4 127.8 L351.9 127.2 L350.1 128 L348.3 127.9 L352.3 126.9 L350.4 126.4 L351.4 126 L353.8 127.3 L352.2 126 L352.9 125.5 L351.4 125.8 L350.7 124.5 L351.3 124.1 L350.3 124.2 L351.2 125.9 L349.9 126.4 L349.7 125.8 L347.7 127.8 L347.2 126 L349.6 125 L347.1 125.6 L347.7 125 L346.9 124.6 L347.7 123.8 L346.4 124.3 L346.2 123.8 L348.6 122.4 L351.5 122.4 L349.7 122 L346.4 123.6 L346.5 122.6 L345.6 123 L346.3 122.5 L345.6 122.7 L345.9 122 L345.5 122.6 L344.5 122.3 L345.9 121.6 L348.4 121.7 L348.3 121.1 L346.9 121.8 L343.8 121.6 L349.6 118.4 L352 118.4 L350.4 118 L343.3 121 L344.9 120.4 L343.4 120.5 L343.5 119.6 L346.6 119.5 L343.8 119.1 L346.1 118.9 L344.7 118.9 L346 118.6 L344.9 118.4 L347.1 118.4 L346.6 117.9 L343.3 118.1 L344.5 117.9 L342.8 117.3 L349.1 116.7 L342.9 117.2 L343 116.4 L346.4 115.1 L350.9 115.9 L349.4 115.4 L352.2 114.8 L349.2 114.8 L350.2 114.4 L348.8 114.6 L350.1 114 Z"
  }), /*#__PURE__*/React.createElement("path", {
    id: "oceania",
    fill: "var(--map-land-warm, #c48f5a)",
    stroke: "rgba(6,16,29,0.38)",
    strokeWidth: "2.5",
    d: "M864.3 492.6 L861.9 491 L862.2 489.9 L860.8 490.8 L860.1 490.2 L861.3 489.6 L860.8 488.5 L859.3 489.5 L860.2 489.5 L860.1 490.1 L857.2 492.1 L854.1 490.3 L852.5 490 L852 490.6 L850.6 489.3 L849.5 489.2 L847.3 486.2 L847.6 484.5 L846.9 482.6 L845.1 480.5 L847.2 483 L846.7 481.9 L845.1 480.4 L843 480.7 L844.2 477.9 L843 475.4 L842.1 478.9 L839.7 479.5 L840.2 478.1 L841.3 478.1 L841.3 475.4 L842.7 473.3 L842.1 469.5 L842.2 471.4 L841.3 471.9 L840.7 473.7 L839.1 474.6 L837.3 476.8 L837.4 478.5 L835.2 477 L835.5 476.5 L836.3 477.1 L834.2 472 L833 471.5 L833.2 472.1 L832.5 471.1 L832.8 469.6 L831.9 469.8 L831.3 468.2 L830 468.6 L829 467.7 L827.6 468 L824.9 466 L819.3 466.8 L814.6 468.8 L811.4 468.9 L806.9 471.5 L805 474.7 L795.6 474.7 L794.7 476.3 L792.8 476.5 L791.1 478.6 L790.6 478.2 L790.5 478.9 L786.7 478.5 L782.8 475.8 L782.8 473.3 L783.7 473.7 L784.6 472.5 L784.4 470.2 L785.1 467.7 L784.7 468 L782.9 462.6 L782.7 458.5 L780.6 454.1 L780.7 452.4 L778 447.2 L778.3 447.5 L778.4 446.7 L778.6 448.1 L778.5 446.7 L779.1 448.9 L779.2 448.3 L779.3 449 L779.8 448.7 L778.9 444.9 L779.5 447.4 L779.9 446.4 L780.4 448.3 L780.8 447.8 L780.9 446.1 L778.6 441 L779.6 437.7 L779.3 434.5 L780.2 432.1 L780.7 431.8 L780.5 434.3 L781.1 434.3 L781.9 431.9 L784.1 430.8 L787.5 427.3 L787.6 427.9 L788.5 427.5 L789 428.2 L791.1 426.6 L792.8 426.5 L793.5 425.3 L794.7 425.7 L798.7 423.8 L800.6 420 L802 418.8 L801.5 415.8 L802.5 414 L803.2 414 L803.4 412.7 L805.1 417 L805.1 415 L806.1 415.8 L806.2 414.2 L805.7 414.5 L805 413.6 L804.9 412.7 L805.5 412.8 L805.1 411.9 L805.8 412 L805.9 412.9 L806 412 L806.6 412.3 L807.3 413.3 L807.3 412.5 L808.8 412.6 L807.3 412.5 L808.2 410.6 L807.5 411.3 L807.2 410.1 L808 408.7 L809.5 409.8 L809.1 408.7 L808.5 408.8 L809 408.3 L808.4 408.3 L809 407.7 L809.3 408.3 L810.1 408.3 L809.2 406.9 L809.8 406 L810.4 406.2 L810.5 405 L810.5 406.6 L810.8 405.7 L811.3 406.6 L811.9 404.8 L812 405.8 L812.8 405.4 L813.2 406.8 L813.1 405.6 Z"
  })), /*#__PURE__*/React.createElement("path", {
    fill: "none",
    stroke: "var(--map-route)",
    strokeWidth: "4",
    strokeLinecap: "round",
    strokeDasharray: "3 13",
    opacity: "0.9",
    d: "M 300 393 Q 260 330 240 213 Q 360 162 520 135 Q 546 250 550 258 Q 694 238 850 225"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "none",
    stroke: "var(--map-route)",
    strokeWidth: "5",
    strokeLinecap: "round",
    opacity: "0.95",
    d: "M 300 393 Q 260 330 240 213 Q 360 162 520 135 Q 546 250 550 258"
  })), cities.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      position: 'absolute',
      left: `${c.x}%`,
      top: `${c.y}%`,
      transform: 'translate(-50%, -100%)',
      zIndex: c.variant === 'current' ? 3 : c.variant === 'next' ? 2 : 1
    }
  }, /*#__PURE__*/React.createElement(MapPin, {
    variant: c.variant,
    label: c.selena ? 'Selena' : c.name,
    selena: c.selena,
    size: c.variant === 'visited' ? 'sm' : 'md'
  }))));
}
Object.assign(window, {
  WorldMap
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/selenas-chase/WorldMap.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CountdownPill = __ds_scope.CountdownPill;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Slider = __ds_scope.Slider;

__ds_ns.COLORWAYS = __ds_scope.COLORWAYS;

__ds_ns.SKIN_TONES = __ds_scope.SKIN_TONES;

__ds_ns.HAIR_COLORS = __ds_scope.HAIR_COLORS;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.BingoTile = __ds_scope.BingoTile;

__ds_ns.CityBadge = __ds_scope.CityBadge;

__ds_ns.LandmarkTile = __ds_scope.LandmarkTile;

__ds_ns.MapPin = __ds_scope.MapPin;

__ds_ns.PredictionCard = __ds_scope.PredictionCard;

__ds_ns.ProgressStrip = __ds_scope.ProgressStrip;

__ds_ns.SkyscraperPair = __ds_scope.SkyscraperPair;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TabBar = __ds_scope.TabBar;

})();
