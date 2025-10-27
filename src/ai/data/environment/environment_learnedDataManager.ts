/**
 * File: src/ai/data/environment/environment_learnedDataManager.ts
 * Purpose: Read/write learned data for environment domain
 * Depends on: environment_utils.ts
 * Depended on by: environment_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./environment_utils"

export const loadEnvironmentLearnedData = async (path = "/src/ai/data/environment/environment_learnedData.json") => {
  try {
    const fs = await import("fs/promises")
    const content = await fs.readFile(path, "utf-8")
    return safeParseJSON(content, { notes: [], concepts: {} })
  } catch {
    return { notes: [], concepts: {} }
  }
}

export const saveEnvironmentLearnedData = async (
  data: unknown,
  path = "/src/ai/data/environment/environment_learnedData.json",
) => {
  try {
    const fs = await import("fs/promises")
    await fs.writeFile(path, JSON.stringify(data, null, 2), "utf-8")
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
