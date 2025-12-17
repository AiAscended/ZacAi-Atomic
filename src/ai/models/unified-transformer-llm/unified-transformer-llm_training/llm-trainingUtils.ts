/**
 * Unified Transformer LLM - Training Utilities
 * Augmentations, schedulers, and training helpers
 */

export function clipGradients(
  gradients: Float32Array,
  maxNorm: number,
): Float32Array {
  const norm = Math.sqrt(gradients.reduce((sum, g) => sum + g * g, 0));
  if (norm > maxNorm) {
    return gradients.map((g) => g * (maxNorm / norm));
  }
  return gradients;
}

export function cosineSchedule(
  step: number,
  totalSteps: number,
  minLR: number = 0,
): number {
  return (
    minLR + 0.5 * (1 - minLR) * (1 + Math.cos((Math.PI * step) / totalSteps))
  );
}

const llmTrainingUtils = { clipGradients, cosineSchedule };

export default llmTrainingUtils;
