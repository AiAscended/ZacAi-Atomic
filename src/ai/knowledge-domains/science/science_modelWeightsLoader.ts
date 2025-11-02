/**
 * File: src/ai/data/science/science_modelWeightsLoader.ts
 * Purpose: Load training weights for science domain
 * Depends on: None
 * Depended on by: science_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { storageAdapter } from "../storageAdapter"

export const scienceLoadWeights = async (path = "/src/ai/knowledge-domains/science/science_weights/science_trainingWeights.bin") => {
  try {
    const raw = await storageAdapter.readFile(path)
    return raw
  } catch (e) {
    return null
  }
}
