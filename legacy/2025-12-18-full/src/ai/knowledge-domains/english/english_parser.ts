/**
 * File: src/ai/data/english/english_parser.ts
 * Purpose: Domain-prefixed parser for English (simple heuristics).
 */

export const englishParser = (text: string) => {
  const t = text.trim();
  const isQuestion = t.endsWith("?");
  const isImperative =
    /^[A-Z]/.test(t) && !isQuestion && t.split(" ").length < 6;
  return { isQuestion, isImperative, raw: t };
};
