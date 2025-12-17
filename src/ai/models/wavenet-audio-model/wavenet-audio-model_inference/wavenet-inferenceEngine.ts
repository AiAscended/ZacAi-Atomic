/**
 * Wavenet-audio-model - Inference Engine
 */

import type { InferenceContext, ModelPayload } from "../../shared/modelTypes"

export class WAVENETInferenceEngine {
  predict(input: ModelPayload, context: InferenceContext = {}): ModelPayload {
    return { ...context, ...input }
  }
}

export default WAVENETInferenceEngine
