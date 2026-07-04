import * as React from 'react';

export interface PredictionCardProps {
  headline?: string;
  /** Eyebrow city name. */
  city?: string;
  /** Current forecast in steps. */
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Fired by both the slider and the synced numeric input. */
  onChange?: (steps: number) => void;
  onSubmit?: () => void;
  /** Switches to the post-submission confirmation state. */
  submitted?: boolean;
  /** Formatted value echoed back in the submitted state. */
  prediction?: string | number;
  /** Stake reminder copy under the FILE FORECAST button. */
  stakeNote?: string;
  /** Optional teammate-preview strip rendered above the button. */
  teammates?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Intercept Forecast console card. Open state: headline + big amber DM Mono
 * readout + large slider + synced numeric input + FILE FORECAST. Locked
 * state: pressed bevel with a red stamp.
 */
export function PredictionCard(props: PredictionCardProps): JSX.Element;
export default PredictionCard;
