/**
 * File: src/ai/data/code_review/code_review_vocabularyManager.ts
 * Purpose: Load seed vocabulary for code review domain
 * Depends on: code_review_utils.ts
 * Depended on by: code_review_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./code_review_utils"
import { storageAdapter } from "../storageAdapter"

export const loadCodeReviewSeedVocabulary = async (
  path = "/src/ai/knowledge-domains/code_review/code_review_seeds/code_review_seedVocabulary.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { patterns: [] }) as { patterns: string[] }
  } catch (error) {
    console.warn("Failed to load code review seed vocabulary", { path, error })
    return { patterns: [] }
  }
}
