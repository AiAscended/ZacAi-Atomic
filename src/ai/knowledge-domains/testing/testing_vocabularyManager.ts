/**
 * File: src/ai/data/testing/testing_vocabularyManager.ts
 * Purpose: Load seed vocabulary for testing domain
 * Depends on: testing_utils.ts, ../storageAdapter.ts
 * Depended on by: testing_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./testing_utils"
import { storageAdapter } from "../storageAdapter"

const DEFAULT_VOCAB_PATH = "/src/ai/knowledge-domains/testing/testing_seeds/testing_seedVocabulary.json"

export interface TestingSeedVocabulary {
  frameworks: string[]
}

export const loadTestingSeedVocabulary = async (
  path = DEFAULT_VOCAB_PATH,
): Promise<TestingSeedVocabulary> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<TestingSeedVocabulary>(raw, { frameworks: [] })
  } catch (error) {
    console.warn("[Testing] Unable to read seed vocabulary:", error)
    return { frameworks: [] }
  }
}
