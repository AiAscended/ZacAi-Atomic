/**
 * File: src/ai/knowledge-domains/documentation/documentation_inferenceController.ts
 * Purpose: Documentation domain inference pipeline wrapper
 * Depends on: documentation_tokenizer.ts, documentation_semanticAnalyzer.ts
 * Depended on by: documentation_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { documentationTokenizer } from "./documentation_tokenizer"
import { documentationSemanticAnalyzer } from "./documentation_semanticAnalyzer"

export const documentationRunInference = async (input: string) => {
  const t = documentationTokenizer(input)
  const sem = documentationSemanticAnalyzer(input)
  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `Documentation analysis: ${sem.commentCount} comments, quality: ${sem.quality}, coverage: ${sem.coverage}.`,
  }
}
