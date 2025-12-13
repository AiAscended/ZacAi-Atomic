/**
 * File: src/ai/data/english/english_vocabularyManager.ts
 * Purpose: Load seed vocabulary for english domain (node-friendly for Codespaces).
 */

import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./english_utils"

export const loadEnglishSeedVocabulary = async (path = "/src/ai/knowledge-domains/english/english_seeds/english_seedVocabulary.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { words: [] }) as { words: string[] }
  } catch (error) {
    console.warn("Failed to load English seed vocabulary", { path, error })
    return { words: [] }
  }
}
