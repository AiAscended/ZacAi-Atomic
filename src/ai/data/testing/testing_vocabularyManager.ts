/**
 * File: src/ai/data/testing/testing_vocabularyManager.ts
 * Purpose: Load seed vocabulary for testing domain
 * Depends on: testing_utils.ts
 * Depended on by: testing_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./testing_utils"

export const loadTestingSeedVocabulary = async (path = "/src/ai/data/testing/testing_seedVocabulary.json") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path, "utf-8")
    return safeParseJSON(raw, { frameworks: [] }) as { frameworks: string[] }
  } catch (e) {
    return { frameworks: [] }
  }
}
