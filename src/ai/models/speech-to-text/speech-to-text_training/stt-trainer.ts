/**
 * Speech-to-text - Training Pipeline
 */

import type { TrainingBatch } from '../../shared/modelTypes';

export class STTTrainer {
  train(data: unknown): void {
    console.log('Training speech-to-text...');
  }
}

export const sttTrainer = new STTTrainer();

