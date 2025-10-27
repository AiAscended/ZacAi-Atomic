/**
 * File: src/ai/data/english/english_vocabularyManager.ts
 * Purpose: Load seed vocabulary for english domain (node-friendly for Codespaces).
 */

import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./english_utils"

export const loadEnglishSeedVocabulary = async (path = "/src/ai/data/english/english_seedVocabulary.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { words: [] }) as { words: string[] }
  } catch (e) {
    return { words: [] }
  }
}
