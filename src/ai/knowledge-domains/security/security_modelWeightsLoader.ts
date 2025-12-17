import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const securityWeightsManager = createDomainWeightsManager({
  domainName: "security",
})

export const securityLoadWeights = async (): Promise<string | null> => {
  return securityWeightsManager.loadWeights()
}

export const primeSecurityWeights = async (): Promise<string | null> => {
  return securityWeightsManager.prime()
}

export const getSecurityActiveWeightArtifact = () => {
  return securityWeightsManager.getActiveWeightArtifact()
}
