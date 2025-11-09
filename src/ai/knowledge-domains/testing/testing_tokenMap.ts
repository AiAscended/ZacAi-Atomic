/**
 * File: src/ai/data/testing/testing_tokenMap.ts
 * Purpose: Build stable token -> id map for testing domain
 * Depends on: testing_tokens.ts
 * Depended on by: testing_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import TESTING_CORE_TOKENS from "./testing_tokens";

export const buildTestingTokenMap = () => {
  const map = new Map<string, number>();
  const reserved = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"];
  reserved.forEach((t, i) => map.set(t, i));
  let idx = reserved.length;
  for (const t of TESTING_CORE_TOKENS) {
    if (map.has(t)) continue;
    map.set(t, idx++);
  }
  return map;
};

export const testingTokenMap = buildTestingTokenMap();
export const getTestingTokenId = (token: string): number =>
  testingTokenMap.get(token) ?? testingTokenMap.get("[UNK]")!;
export const getTestingTokenById = (id: number): string | undefined => {
  for (const [k, v] of testingTokenMap.entries()) if (v === id) return k;
  return undefined;
};
export const testingTokenCount = () => testingTokenMap.size;
export default {
  testingTokenMap,
  getTestingTokenId,
  getTestingTokenById,
  testingTokenCount,
};
