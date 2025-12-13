import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const dataStructuresWeightsManager = createDomainWeightsManager({
  domainName: "data_structures",
})

export const dataStructuresLoadWeights = async () => {
  const weights = await dataStructuresWeightsManager.loadWeights()
  if (!weights) {
    return { success: false, weights: null }
  }
  return { success: true, weights }
}

export const primeDataStructuresWeights = async (): Promise<string | null> => {
  return dataStructuresWeightsManager.prime()
}

export const getDataStructuresActiveWeightArtifact = () => {
  return dataStructuresWeightsManager.getActiveWeightArtifact()
}
