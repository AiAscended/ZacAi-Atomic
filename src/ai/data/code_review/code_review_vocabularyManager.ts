/**
 * File: src/ai/data/code_review/code_review_vocabularyManager.ts
 * Purpose: Load seed vocabulary for code review domain
 * Depends on: code_review_utils.ts
 * Depended on by: code_review_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./code_review_utils"

export const loadCodeReviewSeedVocabulary = async (
  path = "/src/ai/data/code_review/code_review_seedVocabulary.json",
) => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path, "utf-8")
    return safeParseJSON(raw, { patterns: [] }) as { patterns: string[] }
  } catch (e) {
    return { patterns: [] }
  }
}
