/**
 * File: src/ai/data/typescript/typescript_tokenizer.ts
 * Purpose: Tokenizes TypeScript code into domain-specific tokens
 * Depends on: src/ai/data/typescript/typescript_utils.ts, src/ai/data/typescript/typescript_tokens.ts
 * Depended on by: src/ai/data/typescript/typescript_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { normalizeText } from "./typescript_utils"
import TYPESCRIPT_CORE_TOKENS from "./typescript_tokens"

export function typescriptTokenizer(input: string): string[] {
  const normalized = normalizeText(input)
  const tokens: string[] = []

  // TypeScript-specific tokenization patterns
  const codePatterns = [
    /\b(interface|type|class|function|const|let|var|import|export|async|await)\b/g,
    /\b(string|number|boolean|any|void|never|unknown)\b/g,
    /[{}()[\];:,.<>]/g,
    /=>|===|!==|&&|\|\|/g,
  ]

  const remaining = normalized
  const matches: Array<{ token: string; index: number }> = []

  // Extract all pattern matches
  for (const pattern of codePatterns) {
    let match
    while ((match = pattern.exec(remaining)) !== null) {
      matches.push({ token: match[0], index: match.index })
    }
  }

  // Sort by index and extract tokens
  matches.sort((a, b) => a.index - b.index)

  for (const match of matches) {
    if (TYPESCRIPT_CORE_TOKENS.includes(match.token)) {
      tokens.push(match.token)
    }
  }

  // Add system tokens
  const sys = ["<SYS_TYPESCRIPT>", "TYPESCRIPT_BASE"].filter((s) => TYPESCRIPT_CORE_TOKENS.includes(s))
  return [...sys, ...tokens]
}
