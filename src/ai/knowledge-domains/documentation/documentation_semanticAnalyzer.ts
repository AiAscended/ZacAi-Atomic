/**
 * File: src/ai/data/documentation/documentation_semanticAnalyzer.ts
 * Purpose: Documentation semantic analyzer
 * Depends on: documentation_tokenizer.ts, documentation_parser.ts
 * Depended on by: documentation_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { documentationParser } from "./documentation_parser";

export const documentationSemanticAnalyzer = (code: string) => {
  const parsed = documentationParser(code);

  return {
    commentCount: parsed.commentCount,
    hasJSDoc: parsed.hasJSDoc,
    hasTODO: parsed.hasTODO,
    coverage: parsed.coverage,
    quality: parsed.hasJSDoc
      ? "good"
      : parsed.commentCount > 0
        ? "fair"
        : "poor",
  };
};
