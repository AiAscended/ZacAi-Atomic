/**
 * File: src/ai/data/environment/environment_learnedDataManager.ts
 * Purpose: Read/write learned data for environment domain
 * Depends on: environment_utils.ts, storageAdapter.ts
 * Depended on by: environment_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./environment_utils"
import { storageAdapter } from "../storageAdapter"

export const loadEnvironmentLearnedData = async (path = "/src/ai/knowledge-domains/environment/environment_learned/environment_learnedData.json") => {
  try {
    const content = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(content, { notes: [], concepts: {} })
  } catch {
    return { notes: [], concepts: {} }
  }
}

export const saveEnvironmentLearnedData = async (
  data: unknown,
  path = "/src/ai/knowledge-domains/environment/environment_learned/environment_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
