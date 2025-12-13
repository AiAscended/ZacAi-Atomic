/**
 * Convolutional-neural-network - Core Model Implementation
 */

import { ModelConfig, ModelPayload } from '../../shared/modelTypes';

export class CNNModel {
  private readonly config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  forward(input: ModelPayload): ModelPayload {
    const activations = this.config.layers ?? 0;
    return {
      ...input,
      activations,
      lastRun: Date.now(),
    };
  }
}

export const defaultCnnModelConfig: ModelConfig = {
  layers: 3,
  learningRate: 0.001,
};

