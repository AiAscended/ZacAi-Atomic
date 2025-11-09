/**
 * File: src/ai/data/testing/testing_semanticAnalyzer.ts
 * Purpose: Testing semantic analyzer
 * Depends on: testing_tokenizer.ts, testing_parser.ts
 * Depended on by: testing_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { testingParser } from "./testing_parser";

export const testingSemanticAnalyzer = (code: string) => {
  const parsed = testingParser(code);

  return {
    testCount: parsed.testCount,
    assertionCount: parsed.assertionCount,
    patterns: parsed.patterns,
    hasLifecycle: parsed.hasSetup || parsed.hasTeardown,
    coverage: parsed.assertionCount > 0 ? "partial" : "none",
  };
};
