/**
 * File: src/ai/data/error_detection/error_detection_inferenceController.ts
 * Purpose: Error detection domain inference pipeline wrapper
 * Depends on: error_detection_tokenizer.ts, error_detection_semanticAnalyzer.ts
 * Depended on by: error_detection_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { errorDetectionTokenizer } from "./error_detection_tokenizer"
import { errorDetectionSemanticAnalyzer } from "./error_detection_semanticAnalyzer"

export const errorDetectionRunInference = async (input: string) => {
  const t = errorDetectionTokenizer(input)
  const sem = errorDetectionSemanticAnalyzer(input)
  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `Error detection: Found ${sem.errorCount} errors, ${sem.potentialIssues.length} potential issues.`,
  }
}
