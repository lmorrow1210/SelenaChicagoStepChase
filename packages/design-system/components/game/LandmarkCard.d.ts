import * as React from 'react';

export interface LandmarkCardProps {
  variant?: 'decoded' | 'locked';
  cityName?: string;
  landmarkName?: string;
  funFact?: string | null;
  image?: string | null;
  scoutedBy?: string | null;
  scoutedByHref?: string;
  dateLabel?: string | null;
  confirmed?: boolean;
  style?: React.CSSProperties;
}

export function LandmarkCard(props: LandmarkCardProps): JSX.Element;
export default LandmarkCard;
