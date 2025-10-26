import { mathematicsTokenizer } from './mathematics_tokenizer';
import { mathematicsSemanticAnalyzer } from './mathematics_semanticAnalyzer';

export const mathematicsRunInference = async (input: string) => {
  const tk = mathematicsTokenizer(input);
  const sem = mathematicsSemanticAnalyzer(input);
  return {
    tokens: tk.tokens,
    tokenCount: tk.length,
    semantics: sem,
    response: sem.symbols.length
      ? `Detected ${sem.symbols.length} math symbols.`
      : 'No math symbols detected.',
  };
};
