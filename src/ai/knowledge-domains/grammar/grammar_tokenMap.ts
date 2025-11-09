/**
 * File: src/ai/data/grammar/grammar_tokenMap.ts
 * Purpose: Build stable token -> id map for grammar domain
 * Depends on: grammar_tokens.ts
 * Depended on by: grammar_embeddings.ts
 * Creator: Vercel v0 Coding Assistant
 */

import GRAMMAR_CORE_TOKENS from "./grammar_tokens";

export const buildGrammarTokenMap = () => {
  const map = new Map<string, number>();
  const reserved = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"];
  reserved.forEach((t, i) => map.set(t, i));

  let idx = reserved.length;
  for (const t of GRAMMAR_CORE_TOKENS) {
    if (map.has(t)) continue;
    map.set(t, idx++);
  }

  return map;
};

export const grammarTokenMap = buildGrammarTokenMap();

export const getGrammarTokenId = (token: string): number => {
  return grammarTokenMap.get(token) ?? grammarTokenMap.get("[UNK]")!;
};

export const getGrammarTokenById = (id: number): string | undefined => {
  for (const [k, v] of grammarTokenMap.entries()) if (v === id) return k;
  return undefined;
};

export const grammarTokenCount = () => grammarTokenMap.size;

export default {
  grammarTokenMap,
  getGrammarTokenId,
  getGrammarTokenById,
  grammarTokenCount,
};
