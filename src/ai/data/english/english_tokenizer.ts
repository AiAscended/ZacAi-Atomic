/**
 * File: src/ai/data/english/english_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for English (MVP).
 */

import { normalizeText } from './english_utils';

export const englishTokenizer = (text: string) => {
  const t = normalizeText(text).toLowerCase();
  const tokens = t.split(/\W+/).filter(Boolean);
  return { tokens, length: tokens.length };
};
