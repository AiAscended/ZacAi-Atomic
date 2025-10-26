/**
 * File: src/ai/embedding/crossModalityEmbeddingMapper.ts
 * Description: Small mapper to project embeddings from different modalities into a common space.
 */

export const projectToCommonSpace = (vec: number[], targetDim = 8): number[] => {
  // Very small projection: either pad or fold the vector
  const out = new Array<number>(targetDim).fill(0);
  for (let i = 0; i < Math.min(vec.length, targetDim); i++) out[i] = vec[i];
  for (let i = vec.length; i < targetDim; i++) out[i] = 0;
  return out;
};
