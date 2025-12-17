/**
 * Wavenet-audio-model - Training Pipeline
 */

import type { TrainingBatch } from "../../shared/modelTypes"

export class WAVENETTrainer {
  train(_data: unknown): void {
    console.log("Training wavenet-audio-model...");
  }
}

export default WAVENETTrainer
