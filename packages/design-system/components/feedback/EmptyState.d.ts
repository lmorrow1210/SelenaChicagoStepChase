import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface EmptyStateProps {
  /** Icon shown in the dashed circle. */
  icon?: IconName;
  title?: string;
  body?: string;
  /** Render a <Button> (or any node) as the CTA. */
  action?: React.ReactNode;
  /** Accent color for icon + ring. Default --blue. */
  accent?: string;
  style?: React.CSSProperties;
}

/**
 * Encouraging empty state: icon in a dashed ring, display headline,
 * body, and CTA. For no-group, no-nemesis, week-not-started, etc.
 */
export function EmptyState(props: EmptyStateProps): JSX.Element;
export default EmptyState;
