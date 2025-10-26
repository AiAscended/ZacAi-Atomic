/**
 * File: src/ai/input_processing/wordTokenizer.ts
 * Description: Word-level tokenizer suitable for quick tokenization and simple normalization.
 * Dependencies: textNormalizer.ts
 * Dependents: embedding modules, context_manager
 * Role: Tokenize text into words and return tokens and simple ids.
 */

import { textNormalizer } from './textNormalizer';

export const wordTokenizer = (text: string): string[] => {
  const clean = textNormalizer(text);
  // split on whitespace and basic punctuation
  return clean.split(/\s+/).filter(Boolean);
};

export const wordTokenIds = (text: string): number[] => {
  const tokens = wordTokenizer(text);
  const map: Record<string, number> = {};
  let next = 1;
  return tokens.map((t) => {
    if (!map[t]) map[t] = next++;
    return map[t];
  });
};
