/**
 * File: src/ai/data/grammar/grammar_learnedDataManager.ts
 * Purpose: Read/write learned data for grammar domain
 * Depends on: grammar_utils.ts
 * Depended on by: grammar_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./grammar_utils"
import { storageAdapter } from "../storageAdapter"

export type GrammarLearnedData = {
  notes: string[]
  concepts: Record<string, unknown>
}

const DEFAULT_LEARNED_DATA_PATH =
  "/src/ai/knowledge-domains/grammar/grammar_learned/grammar_learnedData.json"

const createDefaultLearnedData = (): GrammarLearnedData => ({ notes: [], concepts: {} })

export const loadGrammarLearnedData = async (
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<GrammarLearnedData> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<GrammarLearnedData>(raw, createDefaultLearnedData())
  } catch (error) {
    console.error("[grammar][learned-data] Failed to load learned data", { path, error })
    return createDefaultLearnedData()
  }
}

export const saveGrammarLearnedData = async (
  data: GrammarLearnedData,
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<boolean> => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("[grammar][learned-data] Failed to persist learned data", { path, error })
    return false
  }
}
