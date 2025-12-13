/**
 * Vision-transformer - Training Pipeline
 */

import type { TrainingBatch } from "../../shared/modelTypes"

export class VITTrainer {
  train(data: TrainingBatch): void {
    const sampleCount = data.length
    console.log(`Training vision-transformer with ${sampleCount} samples`)
  }
}

export default VITTrainer
