/**
 * File: src/ai/data/english/english_inferenceController.ts
 * Purpose: English domain inference pipeline wrapper (prefixed file names).
 */

import { englishTokenizer } from './english_tokenizer';
import { englishSemanticAnalyzer } from './english_semanticAnalyzer';

export const englishRunInference = async (input: string) => {
  const t = englishTokenizer(input);
  const sem = englishSemanticAnalyzer(input);
  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `English domain processed ${t.length} tokens.`,
  };
};
