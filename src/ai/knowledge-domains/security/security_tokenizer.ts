/**
 * File: src/ai/data/security/security_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for security analysis
 * Depends on: security_utils.ts, security_tokens.ts
 * Depended on by: security_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./security_utils"
import SECURITY_CORE_TOKENS from "./security_tokens"

export const securityTokenizer = (text: string, opts?: { includeSystemTokens?: boolean }) => {
  const t = normalizeText(text)
  const tokens: string[] = []
  const raw = t.split(/\s+/).filter(Boolean)

  for (const chunk of raw) {
    const upper = chunk.toUpperCase()
    if (SECURITY_CORE_TOKENS.includes(upper)) {
      tokens.push(upper)
    } else if (/^\d+$/.test(chunk)) {
      for (const ch of chunk) tokens.push(ch)
    } else {
      tokens.push(chunk.toLowerCase())
    }
  }

  if (opts?.includeSystemTokens ?? true) {
    const sys = ["<SYS_SECURITY>", "SECURITY_BASE"].filter((s) => SECURITY_CORE_TOKENS.includes(s))
    return { tokens: [...sys, ...tokens], length: tokens.length + sys.length }
  }

  return { tokens, length: tokens.length }
}
