/**
 * File: src/ai/data/algorithms/algorithms_learnedDataManager.ts
 * Purpose: Read/write learned data for algorithms domain
 * Depends on: algorithms_utils.ts
 * Depended on by: algorithms_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./algorithms_utils"

export const loadAlgorithmsLearnedData = async (path = "/src/ai/data/algorithms/algorithms_learnedData.json") => {
  try {
    const fs = await import("fs/promises")
    const content = await fs.readFile(path, "utf-8")
    return safeParseJSON(content, { notes: [], concepts: {} })
  } catch {
    return { notes: [], concepts: {} }
  }
}

export const saveAlgorithmsLearnedData = async (
  data: unknown,
  path = "/src/ai/data/algorithms/algorithms_learnedData.json",
) => {
  try {
    const fs = await import("fs/promises")
    await fs.writeFile(path, JSON.stringify(data, null, 2), "utf-8")
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
