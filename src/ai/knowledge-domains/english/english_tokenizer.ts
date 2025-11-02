/**
 * File: src/ai/data/english/english_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for English (MVP).
 */

import { normalizeText } from './english_utils';
import ENGLISH_CORE_TOKENS from './english_tokens';

// Tokenizer updated to preserve system tokens like <SYS_ENGLISH> and numeric tokens
/**
 * englishTokenizer
 * - normalizes text
 * - maps digit sequences to NUM_X tokens
 * - prepends domain/system base tokens so downstream modules see a stable marker
 */
export const englishTokenizer = (text: string, opts?: { includeSystemTokens?: boolean }) => {
  const t = normalizeText(text).toLowerCase();

  // split on whitespace first, then on punctuation; keep alphanumerics and underscores
  const raw = t.split(/\s+/).filter(Boolean);
  const tokens: string[] = [];

  for (const chunk of raw) {
    // detect pure numbers -> emit digit tokens that match ENGLISH_CORE_TOKENS (e.g., '0'..'9')
    if (/^\d+$/.test(chunk)) {
      for (const ch of chunk) {
        tokens.push(ch); // '0','1', ... maps to token ids in tokenMap
      }
      continue;
    }

    // split punctuation/words, allow internal underscores and digits
    const parts = chunk.split(/[^a-z0-9_]+/).filter(Boolean);
    for (const p of parts) {
      if (/^\d+$/.test(p)) {
        for (const ch of p) tokens.push(ch);
      } else {
        tokens.push(p);
      }
    }
  }

  // optionally include system/domain tokens at the start; use canonical domain tokens
  if (opts?.includeSystemTokens ?? true) {
    const sys = ['<SYS_ENGLISH>', 'ENGLISH_BASE'].filter((s) => ENGLISH_CORE_TOKENS.includes(s));
    return { tokens: [...sys, ...tokens], length: tokens.length + sys.length };
  }

  return { tokens, length: tokens.length };
};
