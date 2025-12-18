/**
 * File: src/ai/data/code_review/code_review_parser.ts
 * Purpose: Code review-specific parser for code quality analysis
 * Depends on: code_review_utils.ts
 * Depended on by: code_review_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { calculateComplexity, detectCodeSmells } from "./code_review_utils";

/**
 * Parse code for quality metrics and review insights
 */
export const codeReviewParser = (code: string) => {
  const complexity = calculateComplexity(code);
  const smells = detectCodeSmells(code);
  const lines = code.split("\n").length;
  const commentLines = (code.match(/\/\/|\/\*|\*\//g) || []).length;

  // Calculate metrics
  const commentRatio = commentLines / lines;
  const hasTests = /test|spec|describe|it\(/i.test(code);
  const hasTypes = /:\s*(string|number|boolean|any|void|interface|type)/i.test(
    code,
  );

  return {
    complexity,
    smells,
    lines,
    commentRatio,
    hasTests,
    hasTypes,
    quality:
      complexity < 10 && smells.length === 0
        ? "good"
        : complexity > 20
          ? "poor"
          : "fair",
  };
};
