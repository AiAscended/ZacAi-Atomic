/**
 * Speech-to-text - Training Pipeline
 */

import type { TrainingBatch } from '../../shared/modelTypes';

export class STTTrainer {
  train(data: any): void {
    console.log("Training speech-to-text...");
  }
}

export const sttTrainer = new STTTrainer();

