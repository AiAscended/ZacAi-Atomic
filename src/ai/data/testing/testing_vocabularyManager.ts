/**
 * File: src/ai/data/testing/testing_vocabularyManager.ts
 * Purpose: Load seed vocabulary for testing domain
 * Depends on: testing_utils.ts, ../storageAdapter.ts
 * Depended on by: testing_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./testing_utils"
import { storageAdapter } from "../storageAdapter"

export const loadTestingSeedVocabulary = async (path = "/src/ai/data/testing/testing_seedVocabulary.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { frameworks: [] }) as { frameworks: string[] }
  } catch (e) {
    return { frameworks: [] }
  }
}
