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
  path = "/src/ai/data/documentation/documentation_learnedData.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (e) {
    return { notes: [], concepts: {} }
  }
}

export const saveDocumentationLearnedData = async (
  data: unknown,
  path = "/src/ai/data/documentation/documentation_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (e) {
    return false
  }
}
