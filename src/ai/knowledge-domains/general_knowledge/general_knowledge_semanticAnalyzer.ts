import { generalTokenizer } from "./general_knowledge_tokenizer";

export const generalSemanticAnalyzer = (text: string) => {
  const { tokens } = generalTokenizer(text);
  const freq = tokens.reduce<Record<string, number>>(
    (acc: Record<string, number>, t: string) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  return { freq };
};
