import { storageAdapter } from "../storageAdapter"
import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const generalKnowledgeWeightsManager = createDomainWeightsManager({
  domainName: "general_knowledge",
})

export const generalLoadWeights = async (): Promise<ArrayBuffer | null> => {
  try {
    const filename = await generalKnowledgeWeightsManager.resolveActiveWeightFile()
    const fullPath = `${generalKnowledgeWeightsManager.storageBasePath}/${filename}`
    return await storageAdapter.readBinaryFile(fullPath)
  } catch (error) {
    console.error("[general-knowledge][weights] Failed to load weights", { error })
    return null
  }
}

export const primeGeneralKnowledgeWeights = async (): Promise<string | null> => {
  return generalKnowledgeWeightsManager.prime()
}

export const getGeneralKnowledgeActiveWeightArtifact = () => {
  return generalKnowledgeWeightsManager.getActiveWeightArtifact()
}
