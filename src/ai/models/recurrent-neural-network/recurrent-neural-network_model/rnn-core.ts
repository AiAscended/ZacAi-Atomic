/**
 * Recurrent-neural-network - Core Model Implementation
 */

import type { ModelConfig, ModelPayload } from "../../shared/modelTypes"

export class RNNModel {
  private readonly config: ModelConfig

  constructor(config: ModelConfig = {}) {
    this.config = config
  }

  forward(input: ModelPayload): ModelPayload {
    return { ...input, ...this.config }
  }
}

export default RNNModel
