/**
 * File: src/ai/data/data_structures/data_structures_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for data structure analysis
 * Depends on: data_structures_utils.ts, data_structures_tokens.ts
 * Depended on by: data_structures_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./data_structures_utils";
import DATA_STRUCTURES_CORE_TOKENS from "./data_structures_tokens";

export const dataStructuresTokenizer = (
  text: string,
  opts?: { includeSystemTokens?: boolean },
) => {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  const tokens: string[] = [];
  for (const w of words) {
    const upper = w.toUpperCase();
    if (DATA_STRUCTURES_CORE_TOKENS.includes(upper)) {
      tokens.push(upper);
    } else if (DATA_STRUCTURES_CORE_TOKENS.includes(w)) {
      tokens.push(w);
    } else {
      tokens.push(w);
    }
  }

  if (opts?.includeSystemTokens) {
    const sys = ["<SYS_DATA_STRUCTURES>", "DATA_STRUCTURES_BASE"].filter((s) =>
      DATA_STRUCTURES_CORE_TOKENS.includes(s),
    );
    return { tokens: [...sys, ...tokens], count: tokens.length + sys.length };
  }

  return { tokens, count: tokens.length };
};
