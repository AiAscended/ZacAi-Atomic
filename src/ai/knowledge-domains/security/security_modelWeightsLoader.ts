/**
 * File: src/ai/data/security/security_modelWeightsLoader.ts
 * Purpose: Load training weights for security domain
 * Depends on: ../storageAdapter.ts
 * Depended on by: security_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { storageAdapter } from "../storageAdapter";

export const securityLoadWeights = async (
  path = "/src/ai/knowledge-domains/security/security_weights/security_trainingWeights.bin",
) => {
  try {
    const raw = await storageAdapter.readFile(path);
    return raw;
  } catch (e) {
    return null;
  }
};
