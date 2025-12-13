/**
 * File: src/ai/data/documentation/documentation_learnedDataManager.ts
 * Purpose: Read/write learned data for documentation domain
 * Depends on: documentation_utils.ts, ../storageAdapter.ts
 * Depended on by: documentation_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./documentation_utils"
import { storageAdapter } from "../storageAdapter"

export const loadDocumentationLearnedData = async (
  path = "/src/ai/knowledge-domains/documentation/documentation_learned/documentation_learnedData.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (error) {
    console.warn("Failed to load documentation learned data", { path, error })
    return { notes: [], concepts: {} }
  }
}

export const saveDocumentationLearnedData = async (
  data: unknown,
  path = "/src/ai/knowledge-domains/documentation/documentation_learned/documentation_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.warn("Failed to save documentation learned data", { path, error })
    return false
  }
}
