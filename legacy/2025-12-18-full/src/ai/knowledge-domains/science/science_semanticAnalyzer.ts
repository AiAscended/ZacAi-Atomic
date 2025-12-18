import { scienceTokenizer } from "./science_tokenizer";
/**
 * File: src/ai/data/science/science_semanticAnalyzer.ts
 * Purpose: Science semantic analyzer for concepts and relationships
 * Depends on: science_tokenizer.ts, science_parser.ts
 * Depended on by: science_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { scienceParser } from "./science_parser";

/**
 * Analyze scientific content for concepts, formulas, and domain classification
 */
export const scienceSemanticAnalyzer = (text: string) => {
  const { tokens } = scienceTokenizer(text);
  const parsed = scienceParser(text);

  // Extract scientific concepts from tokens
  const concepts = tokens.filter((t) =>
    ["FORCE", "ENERGY", "MASS", "ATOM", "MOLECULE", "CELL", "DNA"].includes(t),
  );

  // Count scientific terminology
  const scientificTermCount = concepts.length;

  return {
    concepts: [...new Set(concepts)],
    scientificTermCount,
    measurements: parsed.hasMeasurement,
    formulas: parsed.hasFormula,
    domains: parsed.domains,
    numbers: parsed.numbers,
    units: parsed.units,
    complexity: parsed.complexity,
  };
};
