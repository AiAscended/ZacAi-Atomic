/**
 * File: src/ai/data/grammar/grammar_tokenMap.ts
 * Purpose: Build stable token -> id map for grammar domain
 * Depends on: grammar_tokens.ts
 * Depended on by: grammar_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import GRAMMAR_CORE_TOKENS from "./grammar_tokens"

const RESERVED_TOKENS = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"] as const

export const buildGrammarTokenMap = () => {
  const map = new Map<string, number>()
  RESERVED_TOKENS.forEach((token, index) => map.set(token, index))

  let idx = RESERVED_TOKENS.length
  for (const token of GRAMMAR_CORE_TOKENS) {
    if (map.has(token)) continue
    map.set(token, idx++)
  }

  return map
}

export const grammarTokenMap = buildGrammarTokenMap()

export const getGrammarTokenId = (token: string): number => {
  return grammarTokenMap.get(token) ?? grammarTokenMap.get("[UNK]")!
}

export const getGrammarTokenById = (id: number): string | undefined => {
  for (const [k, v] of grammarTokenMap.entries()) if (v === id) return k
  return undefined
}

export const grammarTokenCount = () => grammarTokenMap.size

const grammarTokenExports = {
  grammarTokenMap,
  getGrammarTokenId,
  getGrammarTokenById,
  grammarTokenCount,
}

export default grammarTokenExports
