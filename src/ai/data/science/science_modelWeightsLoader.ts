/**
 * File: src/ai/data/science/science_modelWeightsLoader.ts
 * Purpose: Load training weights for science domain
 * Depends on: None
 * Depended on by: science_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export const scienceLoadWeights = async (path = "/src/ai/data/science/science_trainingWeights.bin") => {
  try {
    const fs = require("fs")
    const raw = fs.readFileSync(path)
    return raw
  } catch (e) {
    return null
  }
}
