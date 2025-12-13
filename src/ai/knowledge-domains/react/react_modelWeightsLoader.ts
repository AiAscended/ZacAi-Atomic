import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

interface ModelWeights {
  embedding_layer: number[][]
  attention_weights: Record<string, Record<string, number[][]>>
  feedforward_weights: Record<string, Record<string, number[][]>>
  output_layer: Record<string, number[][]>
}

const reactWeightsManager = createDomainWeightsManager({
  domainName: "react",
})

let cachedWeights: ModelWeights | null = null

export async function loadReactModelWeights(): Promise<ModelWeights> {
  if (cachedWeights) {
    return cachedWeights
  }

  const rawWeights = await reactWeightsManager.loadWeights()
  if (rawWeights) {
    try {
      cachedWeights = JSON.parse(rawWeights) as ModelWeights
      console.log("[React Domain] Loaded model weights from manifest selection")
      return cachedWeights
    } catch (error) {
      console.warn("[React Domain] Unable to parse weights; falling back to baseline", { error })
    }
  }

  cachedWeights = buildFallbackWeights()
  return cachedWeights
}

export function getModelWeights(): ModelWeights | null {
  return cachedWeights
}

export const primeReactWeights = async (): Promise<string | null> => {
  return reactWeightsManager.prime()
}

export const getReactActiveWeightArtifact = () => {
  return reactWeightsManager.getActiveWeightArtifact()
}

const buildFallbackWeights = (): ModelWeights => {
  return {
    embedding_layer: initializeMatrix(68, 128),
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
    output_layer: {
      w: initializeMatrix(128, 68),
    },
  }
}

function initializeMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.1))
}
