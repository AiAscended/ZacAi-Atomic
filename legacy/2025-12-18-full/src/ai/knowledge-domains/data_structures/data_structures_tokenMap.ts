/**
 * File: src/ai/data/data_structures/data_structures_tokenMap.ts
 * Purpose: Build stable token -> id map for data_structures domain
 * Depends on: data_structures_tokens.ts
 * Depended on by: data_structures_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import DATA_STRUCTURES_CORE_TOKENS from "./data_structures_tokens";

export const buildDataStructuresTokenMap = () => {
  const map = new Map<string, number>();
  let id = 0;
  map.set("[PAD]", id++);
  map.set("[UNK]", id++);
  map.set("[CLS]", id++);
  for (const t of DATA_STRUCTURES_CORE_TOKENS) {
    if (!map.has(t)) map.set(t, id++);
  }
  return map;
};

export const dataStructuresTokenMap = buildDataStructuresTokenMap();
export const getDataStructuresTokenId = (token: string): number =>
  dataStructuresTokenMap.get(token) ?? dataStructuresTokenMap.get("[UNK]")!;
export const getDataStructuresTokenById = (id: number): string | undefined => {
  for (const [k, v] of dataStructuresTokenMap.entries()) if (v === id) return k;
  return undefined;
};
export const dataStructuresTokenCount = () => dataStructuresTokenMap.size;
export default {
  dataStructuresTokenMap,
  getDataStructuresTokenId,
  getDataStructuresTokenById,
  dataStructuresTokenCount,
};
