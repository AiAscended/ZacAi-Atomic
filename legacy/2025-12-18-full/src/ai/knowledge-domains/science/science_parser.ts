/**
 * File: src/ai/data/science/science_parser.ts
 * Purpose: Science-specific parser for formulas and equations
 * Depends on: science_utils.ts
 * Depended on by: science_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { extractScientificNumbers, extractUnits } from "./science_utils";

/**
 * Parse scientific text for formulas, equations, and measurements
 */
export const scienceParser = (text: string) => {
  const numbers = extractScientificNumbers(text);
  const units = extractUnits(text);

  // Detect common scientific patterns
  const hasFormula = /[=+\-*/^()]/.test(text) && numbers.length > 0;
  const hasMeasurement = numbers.length > 0 && units.length > 0;

  // Identify scientific domains mentioned
  const domains: string[] = [];
  if (/physics|force|energy|motion|velocity/i.test(text))
    domains.push("physics");
  if (/chemistry|atom|molecule|reaction|element/i.test(text))
    domains.push("chemistry");
  if (/biology|cell|dna|organism|evolution/i.test(text))
    domains.push("biology");

  return {
    numbers,
    units,
    hasFormula,
    hasMeasurement,
    domains,
    complexity: numbers.length + units.length,
  };
};
