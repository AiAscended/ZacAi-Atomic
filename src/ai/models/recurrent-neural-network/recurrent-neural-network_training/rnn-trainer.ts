/**
 * Recurrent-neural-network - Training Pipeline
 */

import type { TrainingBatch } from "../../shared/modelTypes"

export class RNNTrainer {
  train(data: TrainingBatch): void {
    const sampleCount = data.length
    console.log(`Training recurrent-neural-network with ${sampleCount} samples`)
  }
}

export default RNNTrainer
