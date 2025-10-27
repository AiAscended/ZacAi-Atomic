/**
 * File: src/ai/data/testing/testing_modelWeightsLoader.ts
 * Purpose: Load training weights for testing domain
 * Depends on: None
 * Depended on by: testing_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const testingLoadWeights = async (path = "/src/ai/data/testing/testing_trainingWeights.bin") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path)
    return raw
  } catch (e) {
    return null
  }
}
