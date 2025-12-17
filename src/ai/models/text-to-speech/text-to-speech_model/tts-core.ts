/**
 * Text-to-speech - Core Model Implementation
 */

import type { ModelConfig, ModelPayload } from '../../shared/modelTypes';

export class TTSModel {
  private readonly config: ModelConfig;

  constructor(config: ModelConfig = {}) {
    this.config = config;
  }

  forward(input: ModelPayload): ModelPayload {
    return {
      ...input,
      configuration: this.config,
      lastRun: Date.now(),
    };
  }
}

export const defaultTtsConfig: ModelConfig = {
  sampleRate: 22050,
  vocoder: 'griffin-lim',
  encoderLayers: 5,
};

