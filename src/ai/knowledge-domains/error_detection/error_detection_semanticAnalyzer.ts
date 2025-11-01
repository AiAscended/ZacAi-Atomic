/**
 * File: src/ai/data/error_detection/error_detection_semanticAnalyzer.ts
 * Purpose: Error detection semantic analyzer
 * Depends on: error_detection_tokenizer.ts, error_detection_parser.ts
 * Depended on by: error_detection_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { errorDetectionTokenizer } from "./error_detection_tokenizer"
import { errorDetectionParser } from "./error_detection_parser"

export const errorDetectionSemanticAnalyzer = (code: string) => {
  const { tokens } = errorDetectionTokenizer(code)
  const parsed = errorDetectionParser(code)

  return {
    errors: parsed.syntaxErrors,
    errorCount: parsed.errorCount,
    hasErrorHandling: parsed.hasTryCatch,
    potentialIssues: [parsed.hasUndefined && "undefined_usage", parsed.hasNull && "null_usage"].filter(Boolean),
  }
}
