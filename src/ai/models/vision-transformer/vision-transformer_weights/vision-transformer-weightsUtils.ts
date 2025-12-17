/**
 * Vision-transformer - Weights Utilities
 */

import type { WeightDictionary } from "../../shared/modelTypes"

export function loadWeights(path: string): WeightDictionary {
  console.log(`Loading vision-transformer weights from ${path}`)
  return {}
}

const VIT_WEIGHT_UTILS = { loadWeights }

export default VIT_WEIGHT_UTILS
