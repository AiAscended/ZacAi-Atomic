/**
 * File: src/ai/data/testing/testing_learnedDataManager.ts
 * Purpose: Read/write learned data for testing domain
 * Depends on: testing_utils.ts, ../storageAdapter.ts
 * Depended on by: testing_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./testing_utils"
import { storageAdapter } from "../storageAdapter"

const DEFAULT_LEARNED_PATH = "/src/ai/knowledge-domains/testing/testing_learned/testing_learnedData.json"

export interface TestingInteractionRecord {
  input: unknown
  output: unknown
  timestamp: number
}

export interface TestingLearnedData {
  notes: string[]
  concepts: Record<string, unknown>
  interactions: TestingInteractionRecord[]
}

const createDefaultLearnedData = (): TestingLearnedData => ({
  notes: [],
  concepts: {},
  interactions: [],
})

export const loadTestingLearnedData = async (
  path = DEFAULT_LEARNED_PATH,
): Promise<TestingLearnedData> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<TestingLearnedData>(raw, createDefaultLearnedData())
  } catch (error) {
    console.warn("[Testing] Unable to read learned data, using fallback:", error)
    return createDefaultLearnedData()
  }
}

export const saveTestingLearnedData = async (
  data: TestingLearnedData,
  path = DEFAULT_LEARNED_PATH,
): Promise<boolean> => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("[Testing] Failed to persist learned data:", error)
    return false
  }
}
