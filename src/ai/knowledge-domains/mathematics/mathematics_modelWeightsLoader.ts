import { storageAdapter } from "../storageAdapter"
import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const mathematicsWeightsManager = createDomainWeightsManager({
  domainName: "mathematics",
})

export const mathematicsLoadWeights = async (): Promise<ArrayBuffer | null> => {
  try {
    const filename = await mathematicsWeightsManager.resolveActiveWeightFile()
    const fullPath = `${mathematicsWeightsManager.storageBasePath}/${filename}`
    return await storageAdapter.readBinaryFile(fullPath)
  } catch (error) {
    console.error("[mathematics][weights] Failed to load weights", { error })
    return null
  }
}

export const primeMathematicsWeights = async (): Promise<string | null> => {
  return mathematicsWeightsManager.prime()
}

export const getMathematicsActiveWeightArtifact = () => {
  return mathematicsWeightsManager.getActiveWeightArtifact()
}
