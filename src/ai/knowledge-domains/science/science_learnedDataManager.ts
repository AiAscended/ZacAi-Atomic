/**
 * File: src/ai/data/science/science_learnedDataManager.ts
 * Purpose: Read/write learned data for science domain
 * Depends on: science_utils.ts
 * Depended on by: science_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./science_utils"
import { storageAdapter } from "../storageAdapter"

export const loadScienceLearnedData = async (path = "/src/ai/knowledge-domains/science/science_learned/science_learnedData.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (error) {
    console.warn("[science] Failed to load learned data:", error)
    return { notes: [], concepts: {} }
  }
}

export const saveScienceLearnedData = async (data: unknown, path = "/src/ai/knowledge-domains/science/science_learned/science_learnedData.json") => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.warn("[science] Failed to save learned data:", error)
    return false
  }
}
