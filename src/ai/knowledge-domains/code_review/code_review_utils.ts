/**
 * File: src/ai/data/code_review/code_review_utils.ts
 * Purpose: Shared utility functions for code review domain
 * Depends on: None
 * Depended on by: All code_review domain files
 * Creator: Vercel v0 Coding Assistant
 */

export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s) as T;
  } catch (e) {
    return fallback;
  }
};

export const normalizeText = (t: string) => t.replace(/\s+/g, " ").trim();

/**
 * Calculate cyclomatic complexity heuristic
 */
export const calculateComplexity = (code: string): number => {
  const branches = (
    code.match(/\b(if|else|for|while|case|catch|&&|\|\|)\b/g) || []
  ).length;
  return branches + 1;
};

/**
 * Detect code smells in source code
 */
export const detectCodeSmells = (code: string): string[] => {
  const smells: string[] = [];

  // Long method (>50 lines)
  const lines = code.split("\n").length;
  if (lines > 50) smells.push("LONG_METHOD");

  // Magic numbers
  if (/\b\d{2,}\b/.test(code) && !/const|let|var/.test(code))
    smells.push("MAGIC_NUMBER");

  // Duplicate code patterns
  const codeLines = code.split("\n").filter((l) => l.trim());
  const uniqueLines = new Set(codeLines);
  if (codeLines.length > uniqueLines.size * 1.3) smells.push("DUPLICATE_CODE");

  return smells;
};
