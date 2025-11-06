/**
 * File: src/ai/data/grammar/grammar_modelWeightsLoader.ts
 * Purpose: Load training weights for grammar domain
 * Depends on: None
 * Depended on by: grammar_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { storageAdapter } from "../storageAdapter"

export const grammarLoadWeights = async (path = "/src/ai/knowledge-domains/grammar/grammar_weights/grammar_trainingWeights.bin") => {
  try {
    const raw = await storageAdapter.readFile(path)
    return raw
  } catch (e) {
    return null
  }
}
