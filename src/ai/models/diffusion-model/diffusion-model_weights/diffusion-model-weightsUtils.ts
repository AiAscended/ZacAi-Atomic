/**
 * Diffusion-model - Weights Utilities
 */

import type { WeightDictionary } from "../../shared/modelTypes"

export function loadWeights(path: string): WeightDictionary {
  console.log(`Loading diffusion-model weights from ${path}`)
  return {}
}

const DIFFUSION_WEIGHT_UTILS = { loadWeights }

export default DIFFUSION_WEIGHT_UTILS
