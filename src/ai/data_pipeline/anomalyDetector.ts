/**
 * File: src/ai/data_pipeline/anomalyDetector.ts
 * Purpose: Minimal anomaly detector using z-score on numeric sequences (MVP example).
 */

export const isAnomalous = (values: number[], threshold = 3) => {
  if (values.length < 2) return false;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  return values.some((v) => Math.abs((v - mean) / (sd || 1)) > threshold);
};
