/**
 * File: src/ai/data/typescript/typescript_modelWeightsLoader.ts
 * Purpose: Loads trained model weights for TypeScript domain
 * Depends on: None
 * Depended on by: src/ai/data/typescript/typescript_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { storageAdapter } from "../storageAdapter"
import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

const typescriptWeightsManager = createDomainWeightsManager({
  domainName: "typescript",
})

export async function loadTypescriptModelWeights(): Promise<ArrayBuffer | null> {
  try {
    const filename = await typescriptWeightsManager.resolveActiveWeightFile()
    const fullPath = `${typescriptWeightsManager.storageBasePath}/${filename}`
    console.debug(`[TypeScript] Loading model weights from ${fullPath}`)
    return await storageAdapter.readBinaryFile(fullPath)
  } catch (error) {
    console.error("[TypeScript] Failed to load model weights:", error)
    return null
  }
}

export const primeTypescriptWeights = async (): Promise<string | null> => {
  return typescriptWeightsManager.prime()
}

export const getTypescriptActiveWeightArtifact = () => {
  return typescriptWeightsManager.getActiveWeightArtifact()
}
