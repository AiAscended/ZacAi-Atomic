/**
 * File: src/ai/knowledge-domains/grammar/grammar_inferenceController.ts
 * Purpose: Grammar domain inference pipeline wrapper
 * Depends on: grammar_tokenizer.ts, grammar_semanticAnalyzer.ts
 * Depended on by: grammar_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { grammarTokenizer } from "./grammar_tokenizer"
import { grammarSemanticAnalyzer } from "./grammar_semanticAnalyzer"

export const grammarRunInference = async (input: string) => {
  const t = grammarTokenizer(input)
  const sem = grammarSemanticAnalyzer(input)
  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `Grammar domain analyzed ${sem.sentenceStructure.count} sentence(s) with ${sem.punctuationCount} punctuation marks.`,
  }
}
