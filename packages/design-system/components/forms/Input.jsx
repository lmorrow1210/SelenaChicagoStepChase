import * as React from 'react';

/* ============================================================
   Input — text, numeric (large mono), with label + focus ring.
   Dark fill (--card), cream text, blue focus ring.
   ============================================================ */

export function Input({
  value,
  onChange,
  placeholder,
  label,
  type = 'text',
  variant = 'text',   // 'text' | 'numeric'
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
    ...style,
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
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
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
    ...inputStyle,
  };

  return (
    <label style={wrap}>
      {label && (
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)',
        }}>{label}</span>
      )}
      <div style={field}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={input}
          {...rest}
        />
        {suffix && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: isNumeric ? 16 : 13,
            color: 'var(--muted)', whiteSpace: 'nowrap',
          }}>{suffix}</span>
        )}
      </div>
    </label>
  );
}

export default Input;
