/**
 * File: src/ai/data/version_control/version_control_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for version control analysis
 * Depends on: version_control_utils.ts, version_control_tokens.ts
 * Depended on by: version_control_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./version_control_utils";
import VERSION_CONTROL_CORE_TOKENS from "./version_control_tokens";

export const versionControlTokenizer = (
  text: string,
  opts?: { includeSystemTokens?: boolean },
) => {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  const tokens: string[] = [];
  for (const w of words) {
    const upper = w.toUpperCase();
    if (VERSION_CONTROL_CORE_TOKENS.includes(upper)) {
      tokens.push(upper);
    } else if (VERSION_CONTROL_CORE_TOKENS.includes(w)) {
      tokens.push(w);
    } else {
      tokens.push(w);
    }
  }

  if (opts?.includeSystemTokens) {
    const sys = ["<SYS_VERSION_CONTROL>", "VERSION_CONTROL_BASE"].filter((s) =>
      VERSION_CONTROL_CORE_TOKENS.includes(s),
    );
    return { tokens: [...sys, ...tokens], count: tokens.length + sys.length };
  }

  return { tokens, count: tokens.length };
};
