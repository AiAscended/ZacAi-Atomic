/**
 * Diffusion-model - Training Pipeline
 */

import type { TrainingBatch } from "../../shared/modelTypes"

export class DIFFUSIONTrainer {
  train(data: TrainingBatch): void {
    const sampleCount = data.length
    console.log(`Training diffusion-model with ${sampleCount} samples`)
  }
}

export default DIFFUSIONTrainer
