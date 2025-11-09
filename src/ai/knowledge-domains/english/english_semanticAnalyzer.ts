/**
 * File: src/ai/data/english/english_semanticAnalyzer.ts
 * Purpose: English semantic analyzer (MVP heuristics).
 */

import { englishTokenizer } from "./english_tokenizer";

export const englishSemanticAnalyzer = (text: string) => {
  const { tokens } = englishTokenizer(text);
  const entities = tokens.filter((t) => /^[A-Z]/.test(t));
  const freq = tokens.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  return { entities, freq };
};
