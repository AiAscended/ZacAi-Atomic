/**
 * File: src/ai/data/error_detection/error_detection_vocabularyManager.ts
 * Purpose: Load seed vocabulary for error detection domain
 * Depends on: error_detection_utils.ts
 * Depended on by: error_detection_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./error_detection_utils"

export const loadErrorDetectionSeedVocabulary = async (
  path = "/src/ai/data/error_detection/error_detection_seedVocabulary.json",
) => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path, "utf-8")
    return safeParseJSON(raw, { errorTypes: [] }) as { errorTypes: string[] }
  } catch (e) {
    return { errorTypes: [] }
  }
}
