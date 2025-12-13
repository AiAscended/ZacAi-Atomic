/**
 * Recurrent-neural-network - Weights Utilities
 */

import type { WeightDictionary } from "../../shared/modelTypes"

export function loadWeights(path: string): WeightDictionary {
  console.log(`Loading recurrent-neural-network weights from ${path}`)
  return {}
}

const RNN_WEIGHT_UTILS = { loadWeights }

export default RNN_WEIGHT_UTILS
