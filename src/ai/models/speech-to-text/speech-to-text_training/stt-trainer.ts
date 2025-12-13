/**
 * Speech-to-text - Training Pipeline
 */

import type { TrainingBatch } from '../../shared/modelTypes';

export class STTTrainer {
  train(batch: TrainingBatch): void {
    const sampleCount = batch.length;
    const labeledSamples = batch.filter(example => example.target).length;

    console.log('[STTTrainer] Training batch received', { sampleCount, labeledSamples });
  }
}

export const sttTrainer = new STTTrainer();

