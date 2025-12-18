/**
 * File: src/ai/input_processing/textNormalizer.ts
 * Description: Minimal text normalizer (lowercase, trim, remove extra whitespace)
 * Dependencies: none
 * Dependents: tokenizers, detectors
 */

export const textNormalizer = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // invisible chars
    .replace(/[\s]+/g, " ");
};
