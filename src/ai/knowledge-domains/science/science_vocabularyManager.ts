/**
 * File: src/ai/data/science/science_vocabularyManager.ts
 * Purpose: Load seed vocabulary for science domain
 * Depends on: science_utils.ts
 * Depended on by: science_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./science_utils"
import { storageAdapter } from "../storageAdapter"

export const loadScienceSeedVocabulary = async (path = "/src/ai/knowledge-domains/science/science_seeds/science_seedVocabulary.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { concepts: [] }) as { concepts: string[] }
  } catch (e) {
    return { concepts: [] }
  }
}
