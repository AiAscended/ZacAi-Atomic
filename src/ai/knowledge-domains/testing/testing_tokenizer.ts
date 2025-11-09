/**
 * File: src/ai/data/testing/testing_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for testing analysis
 * Depends on: testing_utils.ts, testing_tokens.ts
 * Depended on by: testing_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./testing_utils";
import TESTING_CORE_TOKENS from "./testing_tokens";

export const testingTokenizer = (
  text: string,
  opts?: { includeSystemTokens?: boolean },
) => {
  const t = normalizeText(text);
  const tokens: string[] = [];
  const raw = t.split(/\s+/).filter(Boolean);

  for (const chunk of raw) {
    const upper = chunk.toUpperCase();
    if (TESTING_CORE_TOKENS.includes(upper)) {
      tokens.push(upper);
    } else if (/^\d+$/.test(chunk)) {
      for (const ch of chunk) tokens.push(ch);
    } else {
      tokens.push(chunk.toLowerCase());
    }
  }

  if (opts?.includeSystemTokens ?? true) {
    const sys = ["<SYS_TESTING>", "TESTING_BASE"].filter((s) =>
      TESTING_CORE_TOKENS.includes(s),
    );
    return { tokens: [...sys, ...tokens], length: tokens.length + sys.length };
  }

  return { tokens, length: tokens.length };
};
