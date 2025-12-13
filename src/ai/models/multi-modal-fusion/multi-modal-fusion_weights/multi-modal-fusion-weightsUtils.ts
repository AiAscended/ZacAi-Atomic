/**
 * Multi-modal-fusion - Weights Utilities
 */

import type { WeightDictionary } from "../../shared/modelTypes"

export function loadWeights(path: string): WeightDictionary {
  console.log(`Loading multi-modal-fusion weights from ${path}`)
  return {}
}

const MULTIMODAL_WEIGHT_UTILS = { loadWeights }

export default MULTIMODAL_WEIGHT_UTILS
