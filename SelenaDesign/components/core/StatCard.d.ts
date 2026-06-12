import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface StatCardProps {
  icon?: IconName;
  /** Uppercase tracked label. */
  label: string;
  /** Big mono value (string or number). */
  value: string | number;
  /** Optional unit suffix (e.g. "steps", "km"). */
  unit?: string;
  /** Icon tint. Default --blue. */
  accent?: string;
  style?: React.CSSProperties;
}

/** Compact icon + label + value stat tile for leaderboard and profile. */
export function StatCard(props: StatCardProps): JSX.Element;
