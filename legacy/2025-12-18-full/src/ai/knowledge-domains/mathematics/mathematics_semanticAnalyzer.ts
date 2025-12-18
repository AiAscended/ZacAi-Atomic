import { mathematicsTokenizer } from "./mathematics_tokenizer";

export const mathematicsSemanticAnalyzer = (text: string) => {
  const { tokens } = mathematicsTokenizer(text);
  // simple heuristics: count symbols, detect function names
  const symbols = tokens.filter((t) => /[()+\-*/=^]/.test(t));
  const freq = tokens.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  return { symbols, freq };
};
