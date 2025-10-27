/**
 * File: src/ai/data/grammar/grammar_modelWeightsLoader.ts
 * Purpose: Load training weights for grammar domain
 * Depends on: None
 * Depended on by: grammar_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const grammarLoadWeights = async (path = "/src/ai/data/grammar/grammar_trainingWeights.bin") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path)
    return raw
  } catch (e) {
    return null
  }
}
