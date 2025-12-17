/**
 * File: src/ai/data/english/english_utils.ts
 */

export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s) as T;
  } catch (error) {
    console.warn('Failed to parse English JSON', { error });
    return fallback;
  }
};

export const normalizeText = (t: string) => t.replace(/\s+/g, " ").trim();
