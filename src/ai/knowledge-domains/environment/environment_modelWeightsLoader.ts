import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const environmentWeightsManager = createDomainWeightsManager({
  domainName: "environment",
})

export const environmentLoadWeights = async () => {
  const weights = await environmentWeightsManager.loadWeights()
  if (!weights) {
    return { success: false, weights: null }
  }
  return { success: true, weights }
}

export const primeEnvironmentWeights = async (): Promise<string | null> => {
  return environmentWeightsManager.prime()
}

export const getEnvironmentActiveWeightArtifact = () => {
  return environmentWeightsManager.getActiveWeightArtifact()
}
