import { generalTokenizer } from "./general_tokenizer"

export const generalSemanticAnalyzer = (text: string) => {
  const { tokens } = generalTokenizer(text);
  const freq = tokens.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  return { freq };
};
