import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const systemWeightsManager = createDomainWeightsManager({
  domainName: "system",
  defaultWeightFile: "system_pretrained_weights.json",
  weightConfigFile: "system_weights_config.json",
  baselineNotes: "Initial system domain weights",
})

export const loadSystemModelWeights = async (): Promise<string | null> => {
  return systemWeightsManager.loadWeights()
}

export const primeSystemWeights = async (): Promise<string | null> => {
  return systemWeightsManager.prime()
}

export const getSystemActiveWeightArtifact = () => {
  return systemWeightsManager.getActiveWeightArtifact()
}

export const resolveSystemActiveWeightFile = () => {
  return systemWeightsManager.resolveActiveWeightFile()
}
