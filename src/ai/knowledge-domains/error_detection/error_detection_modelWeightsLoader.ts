import { storageAdapter } from "../storageAdapter"
import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const errorDetectionWeightsManager = createDomainWeightsManager({
  domainName: "error_detection",
})

export const errorDetectionLoadWeights = async (): Promise<ArrayBuffer | null> => {
  try {
    const filename = await errorDetectionWeightsManager.resolveActiveWeightFile()
    const fullPath = `${errorDetectionWeightsManager.storageBasePath}/${filename}`
    return await storageAdapter.readBinaryFile(fullPath)
  } catch (error) {
    console.error("[error-detection][weights] Failed to load weights", { error })
    return null
  }
}

export const primeErrorDetectionWeights = async (): Promise<string | null> => {
  return errorDetectionWeightsManager.prime()
}

export const getErrorDetectionActiveWeightArtifact = () => {
  return errorDetectionWeightsManager.getActiveWeightArtifact()
}
