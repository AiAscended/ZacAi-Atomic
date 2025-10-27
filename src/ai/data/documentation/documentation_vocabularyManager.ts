/**
 * File: src/ai/data/documentation/documentation_vocabularyManager.ts
 * Purpose: Load seed vocabulary for documentation domain
 * Depends on: documentation_utils.ts
 * Depended on by: documentation_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./documentation_utils"

export const loadDocumentationSeedVocabulary = async (
  path = "/src/ai/data/documentation/documentation_seedVocabulary.json",
) => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path, "utf-8")
    return safeParseJSON(raw, { tags: [] }) as { tags: string[] }
  } catch (e) {
    return { tags: [] }
  }
}
