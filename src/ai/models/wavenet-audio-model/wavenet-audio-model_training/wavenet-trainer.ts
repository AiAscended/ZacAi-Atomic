/**
 * Wavenet-audio-model - Training Pipeline
 */

import type { TrainingBatch } from "../../shared/modelTypes"

export class WAVENETTrainer {
  train(data: TrainingBatch): void {
    const sampleCount = data.length
    console.log(`Training wavenet-audio-model with ${sampleCount} samples`)
  }
}

export default WAVENETTrainer
