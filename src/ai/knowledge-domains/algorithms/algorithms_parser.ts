/**
 * File: src/ai/data/algorithms/algorithms_parser.ts
 * Purpose: Algorithms parser for code analysis
 * Depends on: algorithms_utils.ts
 * Depended on by: algorithms_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { detectAlgorithmPatterns } from "./algorithms_utils";

export const algorithmsParser = (code: string) => {
  const algorithms = detectAlgorithmPatterns(code);
  return {
    algorithms,
    complexity:
      algorithms.length > 3 ? "high" : algorithms.length > 1 ? "medium" : "low",
    raw: code,
  };
};
