import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. Default 'primary'. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Optional leading icon name. */
  icon?: IconName;
  /** Optional trailing icon name. */
  iconRight?: IconName;
  /** Shows a spinner and blocks clicks. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/**
 * Pill button for Selena's Chase.
 * @startingPoint section="Core" subtitle="Primary, secondary, danger & ghost buttons" viewport="700x200"
 */
export function Button(props: ButtonProps): JSX.Element;
export default Button;
