import { storageAdapter } from "../storageAdapter"
import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const grammarWeightsManager = createDomainWeightsManager({
  domainName: "grammar",
})

export const grammarLoadWeights = async (): Promise<ArrayBuffer | null> => {
  try {
    const filename = await grammarWeightsManager.resolveActiveWeightFile()
    const fullPath = `${grammarWeightsManager.storageBasePath}/${filename}`
    return await storageAdapter.readBinaryFile(fullPath)
  } catch (error) {
    console.error("[grammar][weights] Failed to load weights", { error })
    return null
  }
}

export const primeGrammarWeights = async (): Promise<string | null> => {
  return grammarWeightsManager.prime()
}

export const getGrammarActiveWeightArtifact = () => {
  return grammarWeightsManager.getActiveWeightArtifact()
}
