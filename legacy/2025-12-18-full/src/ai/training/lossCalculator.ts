/**
 * File: src/ai/training/lossCalculator.ts
 * Purpose: Simple loss calculators for classification/regression (MSE and cross-entropy approximations).
 */

export const mse = (preds: number[], targets: number[]) => {
  const n = preds.length;
  let s = 0;
  for (let i = 0; i < n; i++) s += (preds[i] - targets[i]) ** 2;
  return s / (n || 1);
};

export const crossEntropy = (preds: number[], targets: number[]) => {
  // preds are probabilities, targets one-hot floats
  const eps = 1e-8;
  return -preds.reduce((acc, p, i) => acc + targets[i] * Math.log(p + eps), 0);
};
