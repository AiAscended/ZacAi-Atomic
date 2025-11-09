/**
 * File: src/ai/data/documentation/documentation_modelWeightsLoader.ts
 * Purpose: Load training weights for documentation domain
 * Depends on: ../storageAdapter.ts
 * Depended on by: documentation_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { storageAdapter } from "../storageAdapter";

export const documentationLoadWeights = async (
  path = "/src/ai/knowledge-domains/documentation/documentation_weights/documentation_trainingWeights.bin",
) => {
  try {
    const raw = await storageAdapter.readFile(path);
    return raw;
  } catch (e) {
    return null;
  }
};
