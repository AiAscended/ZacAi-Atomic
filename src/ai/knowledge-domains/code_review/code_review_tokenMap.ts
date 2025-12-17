/**
 * File: src/ai/data/code_review/code_review_tokenMap.ts
 * Purpose: Build stable token -> id map for code review domain
 * Depends on: code_review_tokens.ts
 * Depended on by: code_review_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import CODE_REVIEW_CORE_TOKENS from "./code_review_tokens"

export const buildCodeReviewTokenMap = () => {
  const map = new Map<string, number>()
  const reserved = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"]
  reserved.forEach((t, i) => map.set(t, i))

  let idx = reserved.length
  for (const t of CODE_REVIEW_CORE_TOKENS) {
    if (map.has(t)) continue
    map.set(t, idx++)
  }

  return map
}

export const codeReviewTokenMap = buildCodeReviewTokenMap()

export const getCodeReviewTokenId = (token: string): number => {
  return codeReviewTokenMap.get(token) ?? codeReviewTokenMap.get("[UNK]")!
}

export const getCodeReviewTokenById = (id: number): string | undefined => {
  for (const [k, v] of codeReviewTokenMap.entries()) if (v === id) return k
  return undefined
}

export const codeReviewTokenCount = () => codeReviewTokenMap.size

const codeReviewTokenExports = {
  codeReviewTokenMap,
  getCodeReviewTokenId,
  getCodeReviewTokenById,
  codeReviewTokenCount,
}

export default codeReviewTokenExports
