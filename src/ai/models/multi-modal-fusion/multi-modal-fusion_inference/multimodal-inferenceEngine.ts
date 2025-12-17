/**
 * Multi-modal-fusion - Inference Engine
 */

import type { InferenceContext, ModelPayload } from "../../shared/modelTypes"

export class MULTIMODALInferenceEngine {
  predict(input: ModelPayload, context: InferenceContext = {}): ModelPayload {
    return { ...context, ...input }
  }
}

export default MULTIMODALInferenceEngine
