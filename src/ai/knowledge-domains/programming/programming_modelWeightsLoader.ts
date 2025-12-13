import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

interface ModelWeights {
  embedding_layer: number[][]
  attention_weights: Record<string, Record<string, number[][]>>
  feedforward_weights: Record<string, Record<string, number[][]>>
  output_layer: Record<string, number[][]>
}

const programmingWeightsManager = createDomainWeightsManager({
  domainName: "programming",
})

let cachedWeights: ModelWeights | null = null

export async function loadProgrammingModelWeights(): Promise<ModelWeights> {
  if (cachedWeights) {
    return cachedWeights
  }

  const rawWeights = await programmingWeightsManager.loadWeights()
  if (rawWeights) {
    try {
      cachedWeights = JSON.parse(rawWeights) as ModelWeights
      return cachedWeights
    } catch (error) {
      console.warn("[Programming Domain] Failed to parse weights file, falling back to baseline", { error })
    }
  }

  cachedWeights = buildFallbackWeights()
  return cachedWeights
}

export const primeProgrammingWeights = async (): Promise<string | null> => {
  return programmingWeightsManager.prime()
}

export const getProgrammingActiveWeightArtifact = () => {
  return programmingWeightsManager.getActiveWeightArtifact()
}

const buildFallbackWeights = (): ModelWeights => {
  return {
    embedding_layer: initializeMatrix(72, 128),
    attention_weights: {
      layer_0: {
        query: initializeMatrix(128, 128),
        key: initializeMatrix(128, 128),
        value: initializeMatrix(128, 128),
      },
    },
    feedforward_weights: {
      layer_0: {
        w1: initializeMatrix(128, 256),
        w2: initializeMatrix(256, 128),
      },
    },
    output_layer: { w: initializeMatrix(128, 72) },
  }
}

function initializeMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.1))
}
