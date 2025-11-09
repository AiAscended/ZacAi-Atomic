/**
 * File: src/ai/data/error_detection/error_detection_parser.ts
 * Purpose: Error detection parser for code analysis
 * Depends on: error_detection_utils.ts
 * Depended on by: error_detection_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { detectSyntaxErrors } from "./error_detection_utils";

export const errorDetectionParser = (code: string) => {
  const syntaxErrors = detectSyntaxErrors(code);
  const hasUndefined = /undefined/.test(code);
  const hasNull = /null/.test(code);
  const hasTryCatch = /try\s*{[\s\S]*}\s*catch/.test(code);

  return {
    syntaxErrors,
    hasUndefined,
    hasNull,
    hasTryCatch,
    errorCount: syntaxErrors.length,
  };
};
