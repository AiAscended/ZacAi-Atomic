/**
 * File: src/ai/training/gradientClipper.ts
 * Purpose: Utility to clip gradients by global norm.
 */

export const clipByGlobalNorm = (grads: number[], maxNorm: number) => {
  const norm = Math.sqrt(grads.reduce((s, g) => s + g * g, 0));
  if (norm <= maxNorm) return grads;
  const scale = maxNorm / (norm || 1);
  return grads.map((g) => g * scale);
};
