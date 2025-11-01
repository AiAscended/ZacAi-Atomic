/**
 * File: src/ai/data/testing/testing_learnedDataManager.ts
 * Purpose: Read/write learned data for testing domain
 * Depends on: testing_utils.ts, ../storageAdapter.ts
 * Depended on by: testing_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./testing_utils"
import { storageAdapter } from "../storageAdapter"

export const loadTestingLearnedData = async (path = "/src/ai/data/testing/testing_learnedData.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (e) {
    return { notes: [], concepts: {} }
  }
}

export const saveTestingLearnedData = async (data: unknown, path = "/src/ai/data/testing/testing_learnedData.json") => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (e) {
    return false
  }
}
