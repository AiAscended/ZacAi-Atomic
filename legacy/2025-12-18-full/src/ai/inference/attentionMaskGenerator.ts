/**
 * File: src/ai/inference/attentionMaskGenerator.ts
 * Description: Generate simple attention masks for padded sequences.
 */

export const attentionMaskFromLengths = (
  lengths: number[],
  maxLen?: number,
) => {
  const M = maxLen ?? Math.max(...lengths);
  return lengths.map((l) =>
    Array.from({ length: M }, (_, i) => (i < l ? 1 : 0)),
  );
};
