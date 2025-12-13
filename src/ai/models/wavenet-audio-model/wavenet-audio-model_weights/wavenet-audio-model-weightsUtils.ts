/**
 * Wavenet-audio-model - Weights Utilities
 */

import type { WeightDictionary } from "../../shared/modelTypes"

export function loadWeights(path: string): WeightDictionary {
  console.log(`Loading wavenet-audio-model weights from ${path}`)
  return {}
}

const WAVENET_WEIGHT_UTILS = { loadWeights }

export default WAVENET_WEIGHT_UTILS
