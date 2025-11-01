/**
 * File: src/ai/data/testing/testing_parser.ts
 * Purpose: Testing parser for test code analysis
 * Depends on: testing_utils.ts
 * Depended on by: testing_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { detectTestPatterns } from "./testing_utils"

export const testingParser = (code: string) => {
  const patterns = detectTestPatterns(code)
  const testCount = (code.match(/\b(test|it)\s*\(/g) || []).length
  const assertionCount = (code.match(/\b(expect|assert)\s*\(/g) || []).length

  return {
    patterns,
    testCount,
    assertionCount,
    hasSetup: /beforeEach|beforeAll|setup/i.test(code),
    hasTeardown: /afterEach|afterAll|teardown/i.test(code),
  }
}
