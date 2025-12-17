import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const documentationWeightsManager = createDomainWeightsManager({
  domainName: "documentation",
})

export const documentationLoadWeights = async (): Promise<string | null> => {
  return documentationWeightsManager.loadWeights()
}

export const primeDocumentationWeights = async (): Promise<string | null> => {
  return documentationWeightsManager.prime()
}

export const getDocumentationActiveWeightArtifact = () => {
  return documentationWeightsManager.getActiveWeightArtifact()
}
