/**
 * File: src/ai/data/science/science_utils.ts
 * Purpose: Shared utility functions for science domain
 * Depends on: None
 * Depended on by: All science domain files
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
 * Extract scientific notation numbers from text
 */
export const extractScientificNumbers = (text: string): string[] => {
  const pattern = /[-+]?\d*\.?\d+([eE][-+]?\d+)?/g;
  return text.match(pattern) || [];
};

/**
 * Identify SI units in text
 */
export const extractUnits = (text: string): string[] => {
  const units = [
    "m",
    "kg",
    "s",
    "K",
    "mol",
    "A",
    "cd",
    "N",
    "J",
    "W",
    "Pa",
    "Hz",
    "V",
    "Ω",
  ];
  const found: string[] = [];
  for (const unit of units) {
    const regex = new RegExp(`\\b${unit}\\b`, "g");
    if (regex.test(text)) found.push(unit);
  }
  return found;
};
