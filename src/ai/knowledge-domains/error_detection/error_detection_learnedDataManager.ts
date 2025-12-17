/**
 * File: src/ai/data/error_detection/error_detection_learnedDataManager.ts
 * Purpose: Read/write learned data for error detection domain
 * Depends on: error_detection_utils.ts, ../storageAdapter.ts
 * Depended on by: error_detection_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./error_detection_utils"
import { storageAdapter } from "../storageAdapter"

export type ErrorDetectionLearnedData = {
  notes: string[]
  concepts: Record<string, unknown>
}

const DEFAULT_LEARNED_DATA_PATH =
  "/src/ai/knowledge-domains/error_detection/error_detection_learned/error_detection_learnedData.json"

const createDefaultLearnedData = (): ErrorDetectionLearnedData => ({ notes: [], concepts: {} })

export const loadErrorDetectionLearnedData = async (
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<ErrorDetectionLearnedData> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<ErrorDetectionLearnedData>(raw, createDefaultLearnedData())
  } catch (error) {
    console.error("[error-detection][learned-data] Failed to load learned data", { path, error })
    return createDefaultLearnedData()
  }
}

export const saveErrorDetectionLearnedData = async (
  data: ErrorDetectionLearnedData,
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<boolean> => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("[error-detection][learned-data] Failed to persist learned data", { path, error })
    return false
  }
}
