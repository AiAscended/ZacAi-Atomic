/**
 * File: src/ai/data/version_control/version_control_vocabularyManager.ts
 * Purpose: Load seed vocabulary for version_control domain
 * Depends on: version_control_utils.ts
 * Depended on by: version_control_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./version_control_utils"

export const loadVersionControlSeedVocabulary = async (
  path = "/src/ai/data/version_control/version_control_seedVocabulary.json",
) => {
  try {
    const fs = await import("fs/promises")
    const content = await fs.readFile(path, "utf-8")
    return safeParseJSON(content, { vocab: [] })
  } catch {
    return { vocab: [] }
  }
}
