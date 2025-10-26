/**
 * File: src/ai/embedding/embeddingNormalizer.ts
 * Description: Normalize embeddings (L2 normalization) for retrieval and comparison.
 */

export const l2Normalize = (vec: number[]): number[] => {
  const sum = vec.reduce((s, v) => s + v * v, 0);
  const norm = Math.sqrt(Math.max(1e-12, sum));
  return vec.map((v) => v / norm);
};
