/**
 * File: src/ai/data/documentation/documentation_vocabularyManager.ts
 * Purpose: Load seed vocabulary for documentation domain
 * Depends on: documentation_utils.ts, ../storageAdapter.ts
 * Depended on by: documentation_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./documentation_utils"
import { storageAdapter } from "../storageAdapter"

export const loadDocumentationSeedVocabulary = async (
  path = "/src/ai/knowledge-domains/documentation/documentation_seeds/documentation_seedVocabulary.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { tags: [] }) as { tags: string[] }
  } catch (error) {
    console.warn("Failed to load documentation seed vocabulary", { path, error })
    return { tags: [] }
  }
}
