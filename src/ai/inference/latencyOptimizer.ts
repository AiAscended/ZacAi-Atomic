/**
 * File: src/ai/inference/latencyOptimizer.ts
 * Description: Small utility to estimate latency and pick batch sizes heuristically.
 */

export const estimateLatencyMs = (batchSize: number, seqLen: number) => {
  // trivial heuristic: base + per-token + per-batch
  const base = 5;
  const perToken = 0.02 * seqLen;
  const perBatch = 1.5 * batchSize;
  return base + perToken + perBatch;
};

export const chooseBatchSize = (maxLatencyMs: number, seqLen: number, maxBatch = 32) => {
  for (let b = maxBatch; b >= 1; b--) if (estimateLatencyMs(b, seqLen) <= maxLatencyMs) return b;
  return 1;
};
