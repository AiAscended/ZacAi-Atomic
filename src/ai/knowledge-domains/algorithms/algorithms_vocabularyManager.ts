/**
 * File: src/ai/data/algorithms/algorithms_vocabularyManager.ts
 * Purpose: Load seed vocabulary for algorithms domain
 * Depends on: algorithms_utils.ts, storageAdapter.ts
 * Depended on by: algorithms_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./algorithms_utils"
import { storageAdapter } from "../storageAdapter"

export const loadAlgorithmsSeedVocabulary = async (path = "/src/ai/knowledge-domains/algorithms/algorithms_seeds/algorithms_seedVocabulary.json") => {
  try {
    const content = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(content, { vocab: [] })
  } catch {
    return { vocab: [] }
  }
}
