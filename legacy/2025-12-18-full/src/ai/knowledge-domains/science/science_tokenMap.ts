/**
 * File: src/ai/data/science/science_tokenMap.ts
 * Purpose: Build stable token -> id map for science domain
 * Depends on: science_tokens.ts
 * Depended on by: science_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import SCIENCE_CORE_TOKENS from "./science_tokens";

export const buildScienceTokenMap = () => {
  const map = new Map<string, number>();
  const reserved = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"];
  reserved.forEach((t, i) => map.set(t, i));

  let idx = reserved.length;
  for (const t of SCIENCE_CORE_TOKENS) {
    if (map.has(t)) continue;
    map.set(t, idx++);
  }

  return map;
};

export const scienceTokenMap = buildScienceTokenMap();

export const getScienceTokenId = (token: string): number => {
  return scienceTokenMap.get(token) ?? scienceTokenMap.get("[UNK]")!;
};

export const getScienceTokenById = (id: number): string | undefined => {
  for (const [k, v] of scienceTokenMap.entries()) if (v === id) return k;
  return undefined;
};

export const scienceTokenCount = () => scienceTokenMap.size;

export default {
  scienceTokenMap,
  getScienceTokenId,
  getScienceTokenById,
  scienceTokenCount,
};
