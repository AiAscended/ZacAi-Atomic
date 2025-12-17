/**
 * Recurrent-neural-network - Inference Engine
 */

import type { InferenceContext, ModelPayload } from "../../shared/modelTypes"

export class RNNInferenceEngine {
  predict(input: ModelPayload, context: InferenceContext = {}): ModelPayload {
    return { ...context, ...input }
  }
}

export default RNNInferenceEngine
