/**
 * File: src/ai/data/documentation/documentation_utils.ts
 * Purpose: Shared utility functions for documentation domain
 * Depends on: None
 * Depended on by: All documentation domain files
 * Creator: Vercel v0 Coding Assistant
 */

export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s) as T
  } catch (e) {
    return fallback
  }
}

export const normalizeText = (t: string) => t.replace(/\s+/g, " ").trim()

export const extractDocComments = (code: string): string[] => {
  const jsdocPattern = /\/\*\*[\s\S]*?\*\//g
  const inlinePattern = /\/\/.*/g
  const jsdocs = code.match(jsdocPattern) || []
  const inline = code.match(inlinePattern) || []
  return [...jsdocs, ...inline]
}
