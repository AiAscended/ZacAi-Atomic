/**
 * File: src/ai/data/error_detection/error_detection_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for error detection analysis
 * Depends on: error_detection_utils.ts, error_detection_tokens.ts
 * Depended on by: error_detection_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./error_detection_utils";
import ERROR_DETECTION_CORE_TOKENS from "./error_detection_tokens";

export const errorDetectionTokenizer = (
  text: string,
  opts?: { includeSystemTokens?: boolean },
) => {
  const t = normalizeText(text);
  const tokens: string[] = [];
  const raw = t.split(/\s+/).filter(Boolean);

  for (const chunk of raw) {
    const upper = chunk.toUpperCase();
    if (ERROR_DETECTION_CORE_TOKENS.includes(upper)) {
      tokens.push(upper);
    } else if (/^\d+$/.test(chunk)) {
      for (const ch of chunk) tokens.push(ch);
    } else {
      tokens.push(chunk.toLowerCase());
    }
  }

  if (opts?.includeSystemTokens ?? true) {
    const sys = ["<SYS_ERROR_DETECTION>", "ERROR_DETECTION_BASE"].filter((s) =>
      ERROR_DETECTION_CORE_TOKENS.includes(s),
    );
    return { tokens: [...sys, ...tokens], length: tokens.length + sys.length };
  }

  return { tokens, length: tokens.length };
};
