/**
 * File: src/ai/data/version_control/version_control_tokenMap.ts
 * Purpose: Build stable token -> id map for version_control domain
 * Depends on: version_control_tokens.ts
 * Depended on by: version_control_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import VERSION_CONTROL_CORE_TOKENS from "./version_control_tokens"

export const buildVersionControlTokenMap = () => {
  const map = new Map<string, number>()
  let id = 0
  map.set("[PAD]", id++)
  map.set("[UNK]", id++)
  map.set("[CLS]", id++)
  for (const t of VERSION_CONTROL_CORE_TOKENS) {
    if (!map.has(t)) map.set(t, id++)
  }
  return map
}

export const versionControlTokenMap = buildVersionControlTokenMap()
export const getVersionControlTokenId = (token: string): number =>
  versionControlTokenMap.get(token) ?? versionControlTokenMap.get("[UNK]")!
export const getVersionControlTokenById = (id: number): string | undefined => {
  for (const [k, v] of versionControlTokenMap.entries()) if (v === id) return k
  return undefined
}
export const versionControlTokenCount = () => versionControlTokenMap.size
export default {
  versionControlTokenMap,
  getVersionControlTokenId,
  getVersionControlTokenById,
  versionControlTokenCount,
}
