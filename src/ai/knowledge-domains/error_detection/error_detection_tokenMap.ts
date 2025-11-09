/**
 * File: src/ai/data/error_detection/error_detection_tokenMap.ts
 * Purpose: Build stable token -> id map for error detection domain
 * Depends on: error_detection_tokens.ts
 * Depended on by: error_detection_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import ERROR_DETECTION_CORE_TOKENS from "./error_detection_tokens";

export const buildErrorDetectionTokenMap = () => {
  const map = new Map<string, number>();
  const reserved = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"];
  reserved.forEach((t, i) => map.set(t, i));
  let idx = reserved.length;
  for (const t of ERROR_DETECTION_CORE_TOKENS) {
    if (map.has(t)) continue;
    map.set(t, idx++);
  }
  return map;
};

export const errorDetectionTokenMap = buildErrorDetectionTokenMap();
export const getErrorDetectionTokenId = (token: string): number =>
  errorDetectionTokenMap.get(token) ?? errorDetectionTokenMap.get("[UNK]")!;
export const getErrorDetectionTokenById = (id: number): string | undefined => {
  for (const [k, v] of errorDetectionTokenMap.entries()) if (v === id) return k;
  return undefined;
};
export const errorDetectionTokenCount = () => errorDetectionTokenMap.size;
export default {
  errorDetectionTokenMap,
  getErrorDetectionTokenId,
  getErrorDetectionTokenById,
  errorDetectionTokenCount,
};
