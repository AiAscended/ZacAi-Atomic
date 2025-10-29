/**
 * File: src/ai/data/grammar/grammar_learnedDataManager.ts
 * Purpose: Read/write learned data for grammar domain
 * Depends on: grammar_utils.ts
 * Depended on by: grammar_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./grammar_utils"
import { storageAdapter } from "../storageAdapter"

export const loadGrammarLearnedData = async (path = "/src/ai/data/grammar/grammar_learnedData.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (e) {
    return { notes: [], concepts: {} }
  }
}

export const saveGrammarLearnedData = async (data: unknown, path = "/src/ai/data/grammar/grammar_learnedData.json") => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (e) {
    return false
  }
}
