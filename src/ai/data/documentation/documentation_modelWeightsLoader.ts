/**
 * File: src/ai/data/documentation/documentation_modelWeightsLoader.ts
 * Purpose: Load training weights for documentation domain
 * Depends on: None
 * Depended on by: documentation_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const documentationLoadWeights = async (
  path = "/src/ai/data/documentation/documentation_trainingWeights.bin",
) => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path)
    return raw
  } catch (e) {
    return null
  }
}
