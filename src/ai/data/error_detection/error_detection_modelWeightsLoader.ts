/**
 * File: src/ai/data/error_detection/error_detection_modelWeightsLoader.ts
 * Purpose: Load training weights for error detection domain
 * Depends on: ../storageAdapter.ts
 * Depended on by: error_detection_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { storageAdapter } from "../storageAdapter"

export const errorDetectionLoadWeights = async (
  path = "/src/ai/data/error_detection/error_detection_trainingWeights.bin",
) => {
  try {
    const raw = await storageAdapter.readFile(path)
    return raw
  } catch (e) {
    return null
  }
}
