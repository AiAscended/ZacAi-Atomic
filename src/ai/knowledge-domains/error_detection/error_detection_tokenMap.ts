/**
 * File: src/ai/data/error_detection/error_detection_tokenMap.ts
 * Purpose: Build stable token -> id map for error detection domain
 * Depends on: error_detection_tokens.ts
 * Depended on by: error_detection_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import ERROR_DETECTION_CORE_TOKENS from "./error_detection_tokens"

const RESERVED_TOKENS = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"] as const

export const buildErrorDetectionTokenMap = () => {
  const map = new Map<string, number>()
  RESERVED_TOKENS.forEach((token, index) => map.set(token, index))
  let nextId = RESERVED_TOKENS.length
  for (const token of ERROR_DETECTION_CORE_TOKENS) {
    if (map.has(token)) continue
    map.set(token, nextId++)
  }
  return map
}

export const errorDetectionTokenMap = buildErrorDetectionTokenMap()
export const getErrorDetectionTokenId = (token: string): number =>
  errorDetectionTokenMap.get(token) ?? errorDetectionTokenMap.get("[UNK]")!
export const getErrorDetectionTokenById = (id: number): string | undefined => {
  for (const [k, v] of errorDetectionTokenMap.entries()) if (v === id) return k
  return undefined
}
export const errorDetectionTokenCount = () => errorDetectionTokenMap.size

const errorDetectionTokenExports = {
  errorDetectionTokenMap,
  getErrorDetectionTokenId,
  getErrorDetectionTokenById,
  errorDetectionTokenCount,
}

export default errorDetectionTokenExports
