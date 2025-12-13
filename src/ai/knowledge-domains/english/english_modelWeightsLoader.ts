import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const englishWeightsManager = createDomainWeightsManager({
  domainName: "english",
})

export const englishLoadWeights = async (): Promise<string | null> => {
  return englishWeightsManager.loadWeights()
}

export const primeEnglishWeights = async (): Promise<string | null> => {
  return englishWeightsManager.prime()
}

export const getEnglishActiveWeightArtifact = () => {
  return englishWeightsManager.getActiveWeightArtifact()
}
