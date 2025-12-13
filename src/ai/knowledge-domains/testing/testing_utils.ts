/**
 * File: src/ai/data/testing/testing_utils.ts
 * Purpose: Shared utility functions for testing domain
 * Depends on: None
 * Depended on by: All testing domain files
 * Creator: Vercel v0 Coding Assistant
 */

export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s) as T
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Testing] Unable to parse JSON, returning fallback.", error)
    }
    return fallback
  }
}

export const normalizeText = (t: string) => t.replace(/\s+/g, " ").trim()

export const detectTestPatterns = (code: string): string[] => {
  const patterns: string[] = []
  if (/describe\(|test\(|it\(/i.test(code)) patterns.push("TEST_SUITE")
  if (/expect\(|assert\(/i.test(code)) patterns.push("ASSERTION")
  if (/mock|stub|spy/i.test(code)) patterns.push("MOCK")
  return patterns
}
