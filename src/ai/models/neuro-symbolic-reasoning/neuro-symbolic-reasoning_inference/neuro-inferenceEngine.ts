/**
 * Neuro-symbolic-reasoning - Inference Engine
 */

import type { InferenceContext, ModelPayload } from "../../shared/modelTypes"

export class NEUROInferenceEngine {
  predict(input: ModelPayload, context: InferenceContext = {}): ModelPayload {
    return { ...context, ...input }
  }
}

export default NEUROInferenceEngine
