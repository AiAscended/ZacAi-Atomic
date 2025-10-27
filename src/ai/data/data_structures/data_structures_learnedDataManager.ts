/**
 * File: src/ai/data/data_structures/data_structures_learnedDataManager.ts
 * Purpose: Read/write learned data for data_structures domain
 * Depends on: data_structures_utils.ts
 * Depended on by: data_structures_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./data_structures_utils"

export const loadDataStructuresLearnedData = async (
  path = "/src/ai/data/data_structures/data_structures_learnedData.json",
) => {
  try {
    const fs = await import("fs/promises")
    const content = await fs.readFile(path, "utf-8")
    return safeParseJSON(content, { notes: [], concepts: {} })
  } catch {
    return { notes: [], concepts: {} }
  }
}

export const saveDataStructuresLearnedData = async (
  data: unknown,
  path = "/src/ai/data/data_structures/data_structures_learnedData.json",
) => {
  try {
    const fs = await import("fs/promises")
    await fs.writeFile(path, JSON.stringify(data, null, 2), "utf-8")
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
