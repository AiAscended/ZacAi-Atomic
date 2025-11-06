/**
 * File: src/ai/data/testing/testing_modelWeightsLoader.ts
 * Purpose: Load training weights for testing domain
 * Depends on: ../storageAdapter.ts
 * Depended on by: testing_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { storageAdapter } from "../storageAdapter"

export const testingLoadWeights = async (path = "/src/ai/knowledge-domains/testing/testing_weights/testing_trainingWeights.bin") => {
  try {
    const raw = await storageAdapter.readFile(path)
    return raw
  } catch (e) {
    return null
  }
}
