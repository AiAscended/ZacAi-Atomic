/**
 * File: src/ai/core_reasoning/sparseActivationController.ts
 * Description: Controller to pick top-k activations (sparsity) for gating layers.
 */

export const topKMask = (vec: number[], k: number): number[] => {
  const idx = vec
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v)
    .slice(0, k)
    .map((x) => x.i);
  const mask = new Array(vec.length).fill(0);
  for (const i of idx) mask[i] = 1;
  return mask;
};
