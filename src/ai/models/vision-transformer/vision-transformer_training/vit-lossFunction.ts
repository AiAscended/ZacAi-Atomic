/**
 * Vision-transformer - Loss Function
 */

import type { ModelPayload } from "../../shared/modelTypes"

export function vitLoss(predictions: ModelPayload, targets: ModelPayload): number {
  const predictionSignature = JSON.stringify(predictions)
  const targetSignature = JSON.stringify(targets)
  return predictionSignature === targetSignature ? 0 : 1
}

export default vitLoss
