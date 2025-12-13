/**
 * Vision-transformer - Inference Engine
 */

import type { InferenceContext, ModelPayload } from "../../shared/modelTypes"

export class VITInferenceEngine {
  predict(input: ModelPayload, context: InferenceContext = {}): ModelPayload {
    return { ...context, ...input }
  }
}

export default VITInferenceEngine
