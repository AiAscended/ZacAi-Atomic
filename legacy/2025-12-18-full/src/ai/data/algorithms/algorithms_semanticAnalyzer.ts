/**
 * File: src/ai/data/algorithms/algorithms_semanticAnalyzer.ts
 * Purpose: Algorithms semantic analyzer
 * Depends on: algorithms_tokenizer.ts, algorithms_parser.ts
 * Depended on by: algorithms_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { algorithmsTokenizer } from "./algorithms_tokenizer"
import { algorithmsParser } from "./algorithms_parser"

export const algorithmsSemanticAnalyzer = (code: string) => {
  const { tokens } = algorithmsTokenizer(code)
  const parsed = algorithmsParser(code)
  return { tokens, parsed, semanticScore: tokens.length * 0.1 + parsed.algorithms.length * 2 }
}
