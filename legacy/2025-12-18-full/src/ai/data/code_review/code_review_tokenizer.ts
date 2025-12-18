/**
 * File: src/ai/data/code_review/code_review_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for code review analysis
 * Depends on: code_review_utils.ts, code_review_tokens.ts
 * Depended on by: code_review_inferenceController.ts, code_review_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./code_review_utils"
import CODE_REVIEW_CORE_TOKENS from "./code_review_tokens"

/**
 * codeReviewTokenizer
 * - Tokenizes code with review-specific markers
 * - Identifies code patterns and quality indicators
 * - Preserves code structure tokens
 */
export const codeReviewTokenizer = (text: string, opts?: { includeSystemTokens?: boolean }) => {
  const t = normalizeText(text)
  const tokens: string[] = []

  // Split by whitespace and code delimiters
  const raw = t.split(/(\s+|[{}();,.[\]])/).filter(Boolean)

  for (const chunk of raw) {
    if (/^\s+$/.test(chunk)) continue

    // Check for code review domain tokens
    const upper = chunk.toUpperCase()
    if (CODE_REVIEW_CORE_TOKENS.includes(upper)) {
      tokens.push(upper)
    } else if (/^\d+$/.test(chunk)) {
      for (const ch of chunk) tokens.push(ch)
    } else {
      tokens.push(chunk.toLowerCase())
    }
  }

  // Include system tokens
  if (opts?.includeSystemTokens ?? true) {
    const sys = ["<SYS_CODE_REVIEW>", "CODE_REVIEW_BASE"].filter((s) => CODE_REVIEW_CORE_TOKENS.includes(s))
    return { tokens: [...sys, ...tokens], length: tokens.length + sys.length }
  }

  return { tokens, length: tokens.length }
}
