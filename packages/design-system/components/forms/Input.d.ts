import * as React from 'react';

export interface InputProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** Uppercase tracked label above the field. */
  label?: string;
  type?: string;
  /** 'text' standard field; 'numeric' large centered mono (prediction). */
  variant?: 'text' | 'numeric';
  /** Trailing unit text (e.g. "steps"). */
  suffix?: string;
  disabled?: boolean;
  invalid?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

/**
 * Dark-fill input with blue focus ring. Numeric variant is the large
 * centered monospaced field used on the Prediction screen.
 */
export function Input(props: InputProps): JSX.Element;
export default Input;
