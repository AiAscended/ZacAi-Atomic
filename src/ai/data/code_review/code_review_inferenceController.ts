/**
 * File: src/ai/data/code_review/code_review_inferenceController.ts
 * Purpose: Code review domain inference pipeline wrapper
 * Depends on: code_review_tokenizer.ts, code_review_semanticAnalyzer.ts
 * Depended on by: code_review_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { codeReviewTokenizer } from "./code_review_tokenizer"
import { codeReviewSemanticAnalyzer } from "./code_review_semanticAnalyzer"

export const codeReviewRunInference = async (input: string) => {
  const t = codeReviewTokenizer(input)
  const sem = codeReviewSemanticAnalyzer(input)
  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `Code review: ${sem.quality} quality, complexity ${sem.complexity}, ${sem.recommendations.length} recommendations.`,
  }
}
