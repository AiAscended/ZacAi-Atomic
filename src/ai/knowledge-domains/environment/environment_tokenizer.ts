/**
 * File: src/ai/data/environment/environment_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for environment/DevOps analysis
 * Depends on: environment_utils.ts, environment_tokens.ts
 * Depended on by: environment_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./environment_utils";
import ENVIRONMENT_CORE_TOKENS from "./environment_tokens";

export const environmentTokenizer = (
  text: string,
  opts?: { includeSystemTokens?: boolean },
) => {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  const tokens: string[] = [];
  for (const w of words) {
    const upper = w.toUpperCase();
    if (ENVIRONMENT_CORE_TOKENS.includes(upper)) {
      tokens.push(upper);
    } else if (ENVIRONMENT_CORE_TOKENS.includes(w)) {
      tokens.push(w);
    } else {
      tokens.push(w);
    }
  }

  if (opts?.includeSystemTokens) {
    const sys = ["<SYS_ENVIRONMENT>", "ENVIRONMENT_BASE"].filter((s) =>
      ENVIRONMENT_CORE_TOKENS.includes(s),
    );
    return { tokens: [...sys, ...tokens], count: tokens.length + sys.length };
  }

  return { tokens, count: tokens.length };
};
