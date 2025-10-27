/**
 * File: src/ai/data/version_control/version_control_learnedDataManager.ts
 * Purpose: Read/write learned data for version_control domain
 * Depends on: version_control_utils.ts
 * Depended on by: version_control_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./version_control_utils"

export const loadVersionControlLearnedData = async (
  path = "/src/ai/data/version_control/version_control_learnedData.json",
) => {
  try {
    const fs = await import("fs/promises")
    const content = await fs.readFile(path, "utf-8")
    return safeParseJSON(content, { notes: [], concepts: {} })
  } catch {
    return { notes: [], concepts: {} }
  }
}

export const saveVersionControlLearnedData = async (
  data: unknown,
  path = "/src/ai/data/version_control/version_control_learnedData.json",
) => {
  try {
    const fs = await import("fs/promises")
    await fs.writeFile(path, JSON.stringify(data, null, 2), "utf-8")
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
