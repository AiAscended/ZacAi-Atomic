/**
 * File: src/ai/data/algorithms/algorithms_vocabularyManager.ts
 * Purpose: Load seed vocabulary for algorithms domain
 * Depends on: algorithms_utils.ts
 * Depended on by: algorithms_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./algorithms_utils"

export const loadAlgorithmsSeedVocabulary = async (path = "/src/ai/data/algorithms/algorithms_seedVocabulary.json") => {
  try {
    const fs = await import("fs/promises")
    const content = await fs.readFile(path, "utf-8")
    return safeParseJSON(content, { vocab: [] })
  } catch {
    return { vocab: [] }
  }
}
