import * as React from 'react';

export interface CountdownPillProps {
  /** Hours remaining until the week closes. Drives the color. */
  hoursLeft?: number;
  /** Leading label. Default "Week closes". */
  label?: string;
  style?: React.CSSProperties;
}

/**
 * Week-countdown pill. Color shifts with urgency:
 * --muted default → --gold at ≤48h → --red at ≤24h.
 */
export function CountdownPill(props: CountdownPillProps): JSX.Element;
export default CountdownPill;
