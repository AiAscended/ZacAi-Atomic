/**
 * File: src/ai/input_processing/noiseFilter.ts
 * Description: Remove noise tokens like extra punctuation, control characters, and low-value tokens.
 * Dependencies: textNormalizer
 */

import { textNormalizer } from "./textNormalizer";

export const noiseFilter = (text: string): string => {
  const clean = textNormalizer(text);
  // remove repeated punctuation sequences
  return clean.replace(/[-=_]{2,}/g, " ");
};
