/**
 * File: src/ai/data/environment/environment_tokenMap.ts
 * Purpose: Build stable token -> id map for environment domain
 * Depends on: environment_tokens.ts
 * Depended on by: environment_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import ENVIRONMENT_CORE_TOKENS from "./environment_tokens";

export const buildEnvironmentTokenMap = () => {
  const map = new Map<string, number>();
  let id = 0;
  map.set("[PAD]", id++);
  map.set("[UNK]", id++);
  map.set("[CLS]", id++);
  for (const t of ENVIRONMENT_CORE_TOKENS) {
    if (!map.has(t)) map.set(t, id++);
  }
  return map;
};

export const environmentTokenMap = buildEnvironmentTokenMap();
export const getEnvironmentTokenId = (token: string): number =>
  environmentTokenMap.get(token) ?? environmentTokenMap.get("[UNK]")!;
export const getEnvironmentTokenById = (id: number): string | undefined => {
  for (const [k, v] of environmentTokenMap.entries()) if (v === id) return k;
  return undefined;
};
export const environmentTokenCount = () => environmentTokenMap.size;
export default {
  environmentTokenMap,
  getEnvironmentTokenId,
  getEnvironmentTokenById,
  environmentTokenCount,
};
