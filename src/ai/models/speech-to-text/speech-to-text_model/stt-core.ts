/**
 * Speech-to-text - Core Model Implementation
 */

import type { ModelConfig, ModelPayload } from '../../shared/modelTypes';

export class STTModel {
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

export const defaultSttConfig: ModelConfig = {
  samplingRate: 16000,
  encoderLayers: 6,
  decoderLayers: 4,
};

