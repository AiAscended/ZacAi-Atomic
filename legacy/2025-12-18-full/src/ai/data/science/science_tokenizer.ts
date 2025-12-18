/**
 * File: src/ai/data/science/science_tokenizer.ts
 * Purpose: Domain-prefixed tokenizer for science analysis
 * Depends on: science_utils.ts, science_tokens.ts
 * Depended on by: science_inferenceController.ts, science_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./science_utils"
import SCIENCE_CORE_TOKENS from "./science_tokens"

/**
 * scienceTokenizer
 * - Tokenizes scientific text with domain-specific markers
 * - Preserves scientific notation and units
 * - Identifies scientific terminology
 */
export const scienceTokenizer = (text: string, opts?: { includeSystemTokens?: boolean }) => {
  const t = normalizeText(text)
  const tokens: string[] = []

  // Split by whitespace while preserving scientific notation
  const raw = t.split(/\s+/).filter(Boolean)

  for (const chunk of raw) {
    // Preserve scientific notation (e.g., 1.5e-10)
    if (/^[-+]?\d*\.?\d+([eE][-+]?\d+)?$/.test(chunk)) {
      tokens.push("NUM_SCIENTIFIC")
      continue
    }

    // Check if it's a known science token
    const upper = chunk.toUpperCase()
    if (SCIENCE_CORE_TOKENS.includes(upper)) {
      tokens.push(upper)
    } else if (/^\d+$/.test(chunk)) {
      // Handle pure numbers
      for (const ch of chunk) tokens.push(ch)
    } else {
      // Regular word
      tokens.push(chunk.toLowerCase())
    }
  }

  // Include system tokens
  if (opts?.includeSystemTokens ?? true) {
    const sys = ["<SYS_SCIENCE>", "SCIENCE_BASE"].filter((s) => SCIENCE_CORE_TOKENS.includes(s))
    return { tokens: [...sys, ...tokens], length: tokens.length + sys.length }
  }

  return { tokens, length: tokens.length }
}
