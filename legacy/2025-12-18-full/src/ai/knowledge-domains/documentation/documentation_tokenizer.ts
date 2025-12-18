/**
 * File: src/ai/data/documentation/documentation_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for documentation analysis
 * Depends on: documentation_utils.ts, documentation_tokens.ts
 * Depended on by: documentation_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./documentation_utils";
import DOCUMENTATION_CORE_TOKENS from "./documentation_tokens";

export const documentationTokenizer = (
  text: string,
  opts?: { includeSystemTokens?: boolean },
) => {
  const t = normalizeText(text);
  const tokens: string[] = [];
  const raw = t.split(/\s+/).filter(Boolean);

  for (const chunk of raw) {
    const upper = chunk.toUpperCase();
    if (DOCUMENTATION_CORE_TOKENS.includes(upper)) {
      tokens.push(upper);
    } else if (/^\d+$/.test(chunk)) {
      for (const ch of chunk) tokens.push(ch);
    } else {
      tokens.push(chunk.toLowerCase());
    }
  }

  if (opts?.includeSystemTokens ?? true) {
    const sys = ["<SYS_DOCUMENTATION>", "DOCUMENTATION_BASE"].filter((s) =>
      DOCUMENTATION_CORE_TOKENS.includes(s),
    );
    return { tokens: [...sys, ...tokens], length: tokens.length + sys.length };
  }

  return { tokens, length: tokens.length };
};
