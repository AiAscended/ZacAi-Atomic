/**
 * File: src/ai/data/data_structures/data_structures_vocabularyManager.ts
 * Purpose: Load seed vocabulary for data_structures domain
 * Depends on: data_structures_utils.ts
 * Depended on by: data_structures_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./data_structures_utils"

export const loadDataStructuresSeedVocabulary = async (
  path = "/src/ai/data/data_structures/data_structures_seedVocabulary.json",
) => {
  try {
    const fs = await import("fs/promises")
    const content = await fs.readFile(path, "utf-8")
    return safeParseJSON(content, { vocab: [] })
  } catch {
    return { vocab: [] }
  }
}
