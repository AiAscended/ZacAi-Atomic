/**
 * Diffusion-model - Core Model Implementation
 */

import type { ModelConfig, ModelPayload } from "../../shared/modelTypes"

export class DIFFUSIONModel {
  private readonly config: ModelConfig

  constructor(config: ModelConfig = {}) {
    this.config = config
  }

  forward(input: ModelPayload): ModelPayload {
    return { ...input, ...this.config }
  }
}

export default DIFFUSIONModel
