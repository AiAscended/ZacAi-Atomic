import { generalTokenizer } from './general_tokenizer';
import { generalSemanticAnalyzer } from './general_semanticAnalyzer';

export const generalRunInference = async (input: string) => {
  const t = generalTokenizer(input);
  const sem = generalSemanticAnalyzer(input);
  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `General domain processed ${t.length} tokens.`,
  };
};
