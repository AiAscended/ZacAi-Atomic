/**
 * File: src/ai/data/code_review/code_review_learnedDataManager.ts
 * Purpose: Read/write learned data for code review domain
 * Depends on: code_review_utils.ts
 * Depended on by: code_review_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./code_review_utils"
import { storageAdapter } from "../storageAdapter"

export const loadCodeReviewLearnedData = async (path = "/src/ai/knowledge-domains/code_review/code_review_learned/code_review_learnedData.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (error) {
    console.warn("Failed to load code review learned data", { path, error })
    return { notes: [], concepts: {} }
  }
}

export const saveCodeReviewLearnedData = async (
  data: unknown,
  path = "/src/ai/knowledge-domains/code_review/code_review_learned/code_review_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.warn("Failed to save code review learned data", { path, error })
    return false
  }
}
