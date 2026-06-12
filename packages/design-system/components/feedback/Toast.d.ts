import * as React from 'react';
import { IconName } from '../icons/Icon';

export interface ToastProps {
  /** Sets the left-border accent and default icon. */
  type?: 'achievement' | 'social' | 'alert';
  title?: string;
  message?: string;
  /** Override the default icon for the type. */
  icon?: IconName;
  onClose?: () => void;
  style?: React.CSSProperties;
}

/**
 * Slim notification bar. achievement = gold border, social = blue,
 * alert = red. e.g. "Tokyo — Senso-ji unlocked!"
 */
export function Toast(props: ToastProps): JSX.Element;
export default Toast;
