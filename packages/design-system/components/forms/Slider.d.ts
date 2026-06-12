import * as React from 'react';

export interface SliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  /** Uppercase tracked label; value shows on the right in mono blue. */
  label?: string;
  /** Format the numeric readout. Default toLocaleString. */
  format?: (v: number) => string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Step-target range slider with a blue track fill and glowing thumb. */
export function Slider(props: SliderProps): JSX.Element;
