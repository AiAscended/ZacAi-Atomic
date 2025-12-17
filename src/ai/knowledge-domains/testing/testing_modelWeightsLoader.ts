import { storageAdapter } from "../storageAdapter"
import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const testingWeightsManager = createDomainWeightsManager({
  domainName: "testing",
})

export const testingLoadWeights = async (): Promise<ArrayBuffer | null> => {
  try {
    const filename = await testingWeightsManager.resolveActiveWeightFile()
    const fullPath = `${testingWeightsManager.storageBasePath}/${filename}`
    return await storageAdapter.readBinaryFile(fullPath)
  } catch (error) {
    console.error("[Testing] Unable to load training weights:", error)
    return null
  }
}

export const primeTestingWeights = async (): Promise<string | null> => {
  return testingWeightsManager.prime()
}

export const getTestingActiveWeightArtifact = () => {
  return testingWeightsManager.getActiveWeightArtifact()
}
