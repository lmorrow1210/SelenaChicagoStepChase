import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface BadgeProps {
  children?: React.ReactNode;
  /** Color tone. Default 'blue'. */
  tone?: 'blue' | 'gold' | 'red' | 'bronze' | 'silver' | 'muted';
  /** Optional leading icon. */
  icon?: IconName;
  /** Solid fill with navy text instead of tinted. */
  solid?: boolean;
  style?: React.CSSProperties;
}

/** Small status chip / tag for labels, qualities, and counts. */
export function Badge(props: BadgeProps): JSX.Element;
