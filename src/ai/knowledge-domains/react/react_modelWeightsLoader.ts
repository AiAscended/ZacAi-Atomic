interface ModelWeights {
  embedding_layer: number[][]
  attention_weights: Record<string, Record<string, number[][]>>
  feedforward_weights: Record<string, Record<string, number[][]>>
  output_layer: Record<string, number[][]>
}

let weightsLoaded = false
let modelWeights: ModelWeights | null = null

export async function loadReactModelWeights(): Promise<ModelWeights> {
  if (weightsLoaded && modelWeights) {
    return modelWeights
  }

  try {
    // In a real implementation, this would load from the JSON file
    // For now, we'll initialize with small random weights
    modelWeights = {
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

    weightsLoaded = true
    console.log("[React Domain] Loaded model weights")
    return modelWeights
  } catch (error) {
    console.error("[React Domain] Failed to load model weights:", error)
    throw error
  }
}

function initializeMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.1))
}

export function getModelWeights(): ModelWeights | null {
  return modelWeights
}
