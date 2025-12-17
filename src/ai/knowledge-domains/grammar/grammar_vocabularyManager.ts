/**
 * File: src/ai/data/grammar/grammar_vocabularyManager.ts
 * Purpose: Load seed vocabulary for grammar domain
 * Depends on: grammar_utils.ts
 * Depended on by: grammar_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./grammar_utils"
import { storageAdapter } from "../storageAdapter"

export type GrammarSeedVocabulary = {
  rules: string[]
}

const DEFAULT_SEED_VOCAB_PATH =
  "/src/ai/knowledge-domains/grammar/grammar_seeds/grammar_seedVocabulary.json"

const createDefaultSeedVocabulary = (): GrammarSeedVocabulary => ({ rules: [] })

export const loadGrammarSeedVocabulary = async (
  path = DEFAULT_SEED_VOCAB_PATH,
): Promise<GrammarSeedVocabulary> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<GrammarSeedVocabulary>(raw, createDefaultSeedVocabulary())
  } catch (error) {
    console.error("[grammar][seed-vocabulary] Failed to load seed vocabulary", { path, error })
    return createDefaultSeedVocabulary()
  }
}
