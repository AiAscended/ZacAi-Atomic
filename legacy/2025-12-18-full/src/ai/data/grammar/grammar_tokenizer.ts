/**
 * File: src/ai/data/grammar/grammar_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for grammar analysis
 * Depends on: grammar_utils.ts, grammar_tokens.ts
 * Depended on by: grammar_inferenceController.ts, grammar_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./grammar_utils"
import GRAMMAR_CORE_TOKENS from "./grammar_tokens"

/**
 * grammarTokenizer
 * - Tokenizes text with grammar-specific markers
 * - Identifies punctuation and sentence structure
 * - Preserves system tokens for downstream processing
 */
export const grammarTokenizer = (text: string, opts?: { includeSystemTokens?: boolean }) => {
  const t = normalizeText(text)
  const tokens: string[] = []

  // Split by whitespace and punctuation
  const raw = t.split(/(\s+|[.,;:!?'"()-])/).filter(Boolean)

  for (const chunk of raw) {
    if (/^\s+$/.test(chunk)) continue // skip whitespace

    // Map punctuation to grammar tokens
    if (chunk === ".") tokens.push("PERIOD")
    else if (chunk === ",") tokens.push("COMMA")
    else if (chunk === ";") tokens.push("SEMICOLON")
    else if (chunk === ":") tokens.push("COLON")
    else if (chunk === "?") tokens.push("QUESTION_MARK")
    else if (chunk === "!") tokens.push("EXCLAMATION")
    else if (chunk === "'") tokens.push("APOSTROPHE")
    else if (chunk === '"') tokens.push("QUOTATION")
    else if (chunk === "-") tokens.push("HYPHEN")
    else if (/^\d+$/.test(chunk)) {
      // Handle numbers
      for (const ch of chunk) tokens.push(ch)
    } else {
      tokens.push(chunk.toLowerCase())
    }
  }

  // Include system tokens
  if (opts?.includeSystemTokens ?? true) {
    const sys = ["<SYS_GRAMMAR>", "GRAMMAR_BASE"].filter((s) => GRAMMAR_CORE_TOKENS.includes(s))
    return { tokens: [...sys, ...tokens], length: tokens.length + sys.length }
  }

  return { tokens, length: tokens.length }
}
