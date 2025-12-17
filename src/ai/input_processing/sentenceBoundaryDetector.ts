/**
 * File: src/ai/input_processing/sentenceBoundaryDetector.ts
 * Description: Lightweight sentence boundary detector using punctuation heuristics.
 * Dependencies: textNormalizer
 */

import { textNormalizer } from "./textNormalizer"

export const sentenceBoundaryDetector = (text: string): string[] => {
  const clean = textNormalizer(text)
  // split on sentence punctuation followed by space
  return clean.split(/(?<=[.!?])\s+/).filter(Boolean);
}

export const detectSentences = sentenceBoundaryDetector
