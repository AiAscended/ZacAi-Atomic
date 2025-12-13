/**
 * File: src/ai/data/documentation/documentation_tokenMap.ts
 * Purpose: Build stable token -> id map for documentation domain
 * Depends on: documentation_tokens.ts
 * Depended on by: documentation_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import DOCUMENTATION_CORE_TOKENS from "./documentation_tokens"

export const buildDocumentationTokenMap = () => {
  const map = new Map<string, number>()
  const reserved = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"]
  reserved.forEach((t, i) => map.set(t, i))
  let idx = reserved.length
  for (const t of DOCUMENTATION_CORE_TOKENS) {
    if (map.has(t)) continue
    map.set(t, idx++)
  }
  return map
}

export const documentationTokenMap = buildDocumentationTokenMap()
export const getDocumentationTokenId = (token: string): number =>
  documentationTokenMap.get(token) ?? documentationTokenMap.get("[UNK]")!
export const getDocumentationTokenById = (id: number): string | undefined => {
  for (const [k, v] of documentationTokenMap.entries()) if (v === id) return k
  return undefined
}
export const documentationTokenCount = () => documentationTokenMap.size
const documentationTokenExports = {
  documentationTokenMap,
  getDocumentationTokenId,
  getDocumentationTokenById,
  documentationTokenCount,
}

export default documentationTokenExports
