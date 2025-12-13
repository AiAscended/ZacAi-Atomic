/**
 * Diffusion-model - Inference Engine
 */

import type { InferenceContext, ModelPayload } from "../../shared/modelTypes"

export class DIFFUSIONInferenceEngine {
  predict(input: ModelPayload, context: InferenceContext = {}): ModelPayload {
    return { ...context, ...input }
  }
}

export default DIFFUSIONInferenceEngine
