// Week-close prediction scoring (plan M4): winner = min |predicted − actual|,
// ties broken by earliest submitted_at.

export interface PredictionEntry {
  user_id: string;
  predicted_steps: number;
  submitted_at: Date;
}

export interface ScoredPrediction extends PredictionEntry {
  actual_delta: number;
  is_winner: boolean;
}

export function scorePredictions(
  entries: PredictionEntry[],
  actualTotal: number,
): ScoredPrediction[] {
  const scored = entries.map((e) => ({
    ...e,
    actual_delta: Math.abs(e.predicted_steps - actualTotal),
    is_winner: false,
  }));
  if (scored.length) {
    const winner = scored.reduce((best, e) =>
      e.actual_delta < best.actual_delta ||
      (e.actual_delta === best.actual_delta && e.submitted_at < best.submitted_at)
        ? e
        : best,
    );
    winner.is_winner = true;
  }
  return scored;
}
