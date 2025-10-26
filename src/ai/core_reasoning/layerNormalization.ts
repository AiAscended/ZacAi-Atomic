/**
 * File: src/ai/core_reasoning/layerNormalization.ts
 * Description: Simple layer normalization implementation.
 */

export const layerNorm = (vec: number[], eps = 1e-5): number[] => {
  const mean = vec.reduce((a, b) => a + b, 0) / vec.length;
  const variance = vec.reduce((a, b) => a + (b - mean) ** 2, 0) / vec.length;
  const denom = Math.sqrt(variance + eps);
  return vec.map((v) => (v - mean) / denom);
};
