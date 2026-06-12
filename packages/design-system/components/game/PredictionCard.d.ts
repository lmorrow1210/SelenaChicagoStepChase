import * as React from 'react';

export interface PredictionCardProps {
  headline?: string;
  /** Eyebrow city name. */
  city?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
  /** Switches to the post-submission confirmation state. */
  submitted?: boolean;
  /** Value echoed back in the submitted state. */
  prediction?: string | number;
  style?: React.CSSProperties;
}

/**
 * Central Prediction-screen card over a bright illustrated globe backdrop
 * (the one warm, colorful surface). Headline + large numeric input +
 * submit, with a bouncy confirmation state after submitting.
 */
export function PredictionCard(props: PredictionCardProps): JSX.Element;
export default PredictionCard;
