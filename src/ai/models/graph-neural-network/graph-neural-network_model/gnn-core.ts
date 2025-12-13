/**
 * Graph-neural-network - Core Model Implementation
 */

import type { ModelConfig, ModelPayload } from '../../shared/modelTypes';

export class GNNModel {
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

export const defaultGnnConfig: ModelConfig = {
  messagePassingSteps: 3,
  embeddingSize: 256,
  learningRate: 0.0003,
};

