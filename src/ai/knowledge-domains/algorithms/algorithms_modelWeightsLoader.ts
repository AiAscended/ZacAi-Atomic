import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const algorithmsWeightsManager = createDomainWeightsManager({
  domainName: "algorithms",
})

export const algorithmsLoadWeights = async () => {
  const weights = await algorithmsWeightsManager.loadWeights()
  if (!weights) {
    return { success: false, weights: null }
  }
  return { success: true, weights }
}

export const primeAlgorithmsWeights = async (): Promise<string | null> => {
  return algorithmsWeightsManager.prime()
}

export const getAlgorithmsActiveWeightArtifact = () => {
  return algorithmsWeightsManager.getActiveWeightArtifact()
}
