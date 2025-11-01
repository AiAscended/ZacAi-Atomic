/**
 * File: src/ai/data/data_structures/data_structures_parser.ts
 * Purpose: Data structures parser for code analysis
 * Depends on: data_structures_utils.ts
 * Depended on by: data_structures_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { detectDataStructurePatterns } from "./data_structures_utils"

export const dataStructuresParser = (code: string) => {
  const structures = detectDataStructurePatterns(code)
  return {
    structures,
    complexity: structures.length > 3 ? "high" : structures.length > 1 ? "medium" : "low",
    raw: code,
  }
}
