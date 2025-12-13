/**
 * File: src/ai/data/security/security_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for security analysis
 * Depends on: security_utils.ts, security_tokens.ts
 * Depended on by: security_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./security_utils"
import SECURITY_CORE_TOKENS from "./security_tokens"

export interface SecurityTokenizerOptions {
  includeSystemTokens?: boolean
}

export interface SecurityTokenizerResult {
  tokens: string[]
  length: number
}

const SYSTEM_TOKENS = ["<SYS_SECURITY>", "SECURITY_BASE"] as const

/**
 * Tokenize arbitrary input while keeping domain primitives intact.
 */
export const securityTokenizer = (
  text: string,
  opts: SecurityTokenizerOptions = {}
): SecurityTokenizerResult => {
  const normalizedText = normalizeText(text)
  const tokens: string[] = []
  const rawSegments = normalizedText.split(/\s+/).filter(Boolean)

  for (const chunk of rawSegments) {
    const upper = chunk.toUpperCase()
    if (SECURITY_CORE_TOKENS.includes(upper)) {
      tokens.push(upper)
    } else if (/^\d+$/.test(chunk)) {
      for (const digit of chunk) tokens.push(digit)
    } else {
      tokens.push(chunk.toLowerCase())
    }
  }

  const includeSystemTokens = opts.includeSystemTokens ?? true
  if (includeSystemTokens) {
    const sysTokens = SYSTEM_TOKENS.filter((token) => SECURITY_CORE_TOKENS.includes(token))
    return { tokens: [...sysTokens, ...tokens], length: tokens.length + sysTokens.length }
  }

  return { tokens, length: tokens.length }
}
