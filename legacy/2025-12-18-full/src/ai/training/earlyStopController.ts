/**
 * File: src/ai/training/earlyStopController.ts
 * Purpose: Simple early stopping utility based on patience and metric improvement.
 */

export const makeEarlyStop = (patience = 3) => {
  let best = Infinity;
  let wait = 0;
  return (metric: number) => {
    if (metric < best) {
      best = metric;
      wait = 0;
      return false;
    }
    wait++;
    return wait >= patience;
  };
};
