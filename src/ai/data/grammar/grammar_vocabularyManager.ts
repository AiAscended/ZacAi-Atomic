/**
 * File: src/ai/data/grammar/grammar_vocabularyManager.ts
 * Purpose: Load seed vocabulary for grammar domain
 * Depends on: grammar_utils.ts
 * Depended on by: grammar_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./grammar_utils"

export const loadGrammarSeedVocabulary = async (path = "/src/ai/data/grammar/grammar_seedVocabulary.json") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path, "utf-8")
    return safeParseJSON(raw, { rules: [] }) as { rules: string[] }
  } catch (e) {
    return { rules: [] }
  }
}
