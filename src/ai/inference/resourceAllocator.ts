/**
 * File: src/ai/inference/resourceAllocator.ts
 * Description: Minimal resource allocator for CPU/GPU tokens (stub for MVP).
 */

export type ResourcePlan = { device: 'cpu' | 'gpu'; threads: number };

export const simpleAllocator = (seqLen: number, batchSize: number): ResourcePlan => {
  // small heuristic: use GPU for heavy loads
  if (seqLen * batchSize > 20000) return { device: 'gpu', threads: 8 };
  return { device: 'cpu', threads: 2 };
};
