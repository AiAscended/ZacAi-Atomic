/**
 * Wavenet-audio-model - Loss Function
 */

import type { ModelPayload } from "../../shared/modelTypes"

export function wavenetLoss(predictions: ModelPayload, targets: ModelPayload): number {
  const predictionSignature = JSON.stringify(predictions)
  const targetSignature = JSON.stringify(targets)
  return predictionSignature === targetSignature ? 0 : 1
}

export default wavenetLoss
