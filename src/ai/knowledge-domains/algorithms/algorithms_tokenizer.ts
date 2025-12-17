/**
 * File: src/ai/data/algorithms/algorithms_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for algorithm analysis
 * Depends on: algorithms_utils.ts, algorithms_tokens.ts
 * Depended on by: algorithms_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./algorithms_utils";
import ALGORITHMS_CORE_TOKENS from "./algorithms_tokens";

export const algorithmsTokenizer = (
  text: string,
  opts?: { includeSystemTokens?: boolean },
) => {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  const tokens: string[] = [];
  for (const w of words) {
    const upper = w.toUpperCase();
    if (ALGORITHMS_CORE_TOKENS.includes(upper)) {
      tokens.push(upper);
    } else if (ALGORITHMS_CORE_TOKENS.includes(w)) {
      tokens.push(w);
    } else {
      tokens.push(w);
    }
  }

  if (opts?.includeSystemTokens) {
    const sys = ["<SYS_ALGORITHMS>", "ALGORITHMS_BASE"].filter((s) =>
      ALGORITHMS_CORE_TOKENS.includes(s),
    );
    return { tokens: [...sys, ...tokens], count: tokens.length + sys.length };
  }

  return { tokens, count: tokens.length };
};
