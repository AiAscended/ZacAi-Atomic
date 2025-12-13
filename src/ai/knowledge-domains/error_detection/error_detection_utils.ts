/**
 * File: src/ai/data/error_detection/error_detection_utils.ts
 * Purpose: Shared utility functions for error detection domain
 * Depends on: None
 * Depended on by: All error_detection domain files
 * Creator: Vercel v0 Coding Assistant
 */

export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}

export const normalizeText = (t: string) => t.replace(/\s+/g, " ").trim()

export const detectSyntaxErrors = (code: string): string[] => {
  const errors: string[] = []
  const openBrackets = (code.match(/[{[(]/g) || []).length
  const closeBrackets = (code.match(/[}\])]/g) || []).length
  if (openBrackets !== closeBrackets) errors.push("UNCLOSED_BRACKET")
  if (/\bfunction\s+\w+\s*$$[^)]*$$\s*(?!{)/.test(code)) errors.push("MISSING_FUNCTION_BODY")
  return errors
}
