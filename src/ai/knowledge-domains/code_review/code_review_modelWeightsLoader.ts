import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const codeReviewWeightsManager = createDomainWeightsManager({
  domainName: "code_review",
})

export const codeReviewLoadWeights = async (): Promise<string | null> => {
  return codeReviewWeightsManager.loadWeights()
}

export const primeCodeReviewWeights = async (): Promise<string | null> => {
  return codeReviewWeightsManager.prime()
}

export const getCodeReviewActiveWeightArtifact = () => {
  return codeReviewWeightsManager.getActiveWeightArtifact()
}
