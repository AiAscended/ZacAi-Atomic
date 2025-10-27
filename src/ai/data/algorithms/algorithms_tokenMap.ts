/**
 * File: src/ai/data/algorithms/algorithms_tokenMap.ts
 * Purpose: Build stable token -> id map for algorithms domain
 * Depends on: algorithms_tokens.ts
 * Depended on by: algorithms_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import ALGORITHMS_CORE_TOKENS from "./algorithms_tokens"

export const buildAlgorithmsTokenMap = () => {
  const map = new Map<string, number>()
  let id = 0
  map.set("[PAD]", id++)
  map.set("[UNK]", id++)
  map.set("[CLS]", id++)
  for (const t of ALGORITHMS_CORE_TOKENS) {
    if (!map.has(t)) map.set(t, id++)
  }
  return map
}

export const algorithmsTokenMap = buildAlgorithmsTokenMap()
export const getAlgorithmsTokenId = (token: string): number =>
  algorithmsTokenMap.get(token) ?? algorithmsTokenMap.get("[UNK]")!
export const getAlgorithmsTokenById = (id: number): string | undefined => {
  for (const [k, v] of algorithmsTokenMap.entries()) if (v === id) return k
  return undefined
}
export const algorithmsTokenCount = () => algorithmsTokenMap.size
export default { algorithmsTokenMap, getAlgorithmsTokenId, getAlgorithmsTokenById, algorithmsTokenCount }
