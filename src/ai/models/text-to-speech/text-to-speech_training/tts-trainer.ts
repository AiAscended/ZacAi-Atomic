/**
 * Text-to-speech - Training Pipeline
 */

import type { TrainingBatch } from '../../shared/modelTypes';

export class TTSTrainer {
  train(_data: unknown): void {
    console.log('Training text-to-speech...');
  }
}

export const ttsTrainer = new TTSTrainer();

