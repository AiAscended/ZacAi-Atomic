/**
 * File: src/ai/data/security/security_tokenMap.ts
 * Purpose: Build stable token -> id map for security domain
 * Depends on: security_tokens.ts
 * Depended on by: security_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import SECURITY_CORE_TOKENS from "./security_tokens"

export const buildSecurityTokenMap = () => {
  const map = new Map<string, number>()
  const reserved = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"]
  reserved.forEach((t, i) => map.set(t, i))
  let idx = reserved.length
  for (const t of SECURITY_CORE_TOKENS) {
    if (map.has(t)) continue
    map.set(t, idx++)
  }
  return map
}

export const securityTokenMap = buildSecurityTokenMap()
export const getSecurityTokenId = (token: string): number =>
  securityTokenMap.get(token) ?? securityTokenMap.get("[UNK]")!
export const getSecurityTokenById = (id: number): string | undefined => {
  for (const [k, v] of securityTokenMap.entries()) if (v === id) return k
  return undefined
}
export const securityTokenCount = () => securityTokenMap.size
const securityTokenApi = { securityTokenMap, getSecurityTokenId, getSecurityTokenById, securityTokenCount }

export default securityTokenApi
