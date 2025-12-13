/**
 * Convolutional-neural-network - Loss Function
 */

import { ModelPayload } from '../../shared/modelTypes';

export function cnnLoss(predictions: ModelPayload, targets: ModelPayload): number {
  const predictionKeys = Object.keys(predictions).length;
  const targetKeys = Object.keys(targets).length;
  const difference = Math.abs(predictionKeys - targetKeys);

  return difference / Math.max(1, targetKeys);
}

