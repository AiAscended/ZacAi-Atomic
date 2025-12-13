/**
 * File: src/ai/data/version_control/version_control_modelWeightsLoader.ts
 * Purpose: Load training weights for version_control domain
 * Depends on: storageAdapter.ts
 * Depended on by: version_control_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const versionControlWeightsManager = createDomainWeightsManager({
  domainName: "version_control",
})

export const versionControlLoadWeights = async () => {
  const weights = await versionControlWeightsManager.loadWeights()
  if (!weights) {
    return { success: false, weights: null }
  }

  return { success: true, weights }
}

export const primeVersionControlWeights = async (): Promise<string | null> => {
  return versionControlWeightsManager.prime()
}

export const getVersionControlActiveWeightArtifact = () => {
  return versionControlWeightsManager.getActiveWeightArtifact()
}
