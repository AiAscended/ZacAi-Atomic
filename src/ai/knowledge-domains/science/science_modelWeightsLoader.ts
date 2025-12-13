import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const scienceWeightsManager = createDomainWeightsManager({
  domainName: "science",
})

export const scienceLoadWeights = async (): Promise<string | null> => {
  return scienceWeightsManager.loadWeights()
}

export const primeScienceWeights = async (): Promise<string | null> => {
  return scienceWeightsManager.prime()
}

export const getScienceActiveWeightArtifact = () => {
  return scienceWeightsManager.getActiveWeightArtifact()
}
