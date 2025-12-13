import type { WeightArtifactEntry } from "../../shared/weights/weightsManifestManager"
import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

export type NextjsModelWeights = Record<string, unknown>

let cachedWeights: NextjsModelWeights | null = null
let cachedArtifact: WeightArtifactEntry | null = null
let loadPromise: Promise<NextjsModelWeights> | null = null

const nextjsWeightsManager = createDomainWeightsManager({
  domainName: "nextjs",
})

export async function loadNextjsModelWeights(): Promise<NextjsModelWeights> {
  if (cachedWeights) {
    return cachedWeights
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      const rawWeights = await nextjsWeightsManager.loadWeights()
      if (!rawWeights) {
        throw new Error("[Next.js Domain] No weights available to load")
      }

      try {
        cachedWeights = JSON.parse(rawWeights) as NextjsModelWeights
      } catch (error) {
        console.error("[Next.js Domain] Failed to parse weights file", error)
        throw error
      }

      cachedArtifact = await nextjsWeightsManager.getActiveWeightArtifact()
      const descriptor = cachedArtifact?.file ?? "unknown"
      console.log(
        `[Next.js Domain] Loaded ${cachedArtifact?.type ?? "pretrained"} weights (${descriptor})`
      )

      return cachedWeights
    })()
  }

  try {
    return await loadPromise
  } finally {
    loadPromise = null
  }
}

export function getModelWeights(): NextjsModelWeights | null {
  return cachedWeights
}

export function getModelWeightsMetadata(): WeightArtifactEntry | null {
  return cachedArtifact
}

export const primeNextjsWeights = async (): Promise<string | null> => {
  return nextjsWeightsManager.prime()
}

export const getNextjsActiveWeightArtifact = () => {
  return nextjsWeightsManager.getActiveWeightArtifact()
}
