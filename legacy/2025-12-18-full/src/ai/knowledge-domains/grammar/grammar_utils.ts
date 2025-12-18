/**
 * File: src/ai/data/grammar/grammar_utils.ts
 * Purpose: Shared utility functions for grammar domain
 * Depends on: None
 * Depended on by: All grammar domain files
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
 * Detect sentence boundaries for grammar analysis
 */
export const splitSentences = (text: string): string[] => {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
};
