/**
 * File: src/ai/embedding/embeddingQuantizer.ts
 * Description: Simple uniform quantizer for embeddings (placeholder).
 */

export const quantize = (vec: number[], levels = 256): number[] => {
  return vec.map((v) => Math.round(v * (levels - 1)) / (levels - 1));
};
