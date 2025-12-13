/**
 * Speech-to-text - Inference Engine
 */

import type { InferenceContext, ModelPayload } from '../../shared/modelTypes';

export class STTInferenceEngine {
  predict(input: ModelPayload, context?: InferenceContext): ModelPayload {
    const result = {
      ...input,
      ...context,
      predictedAt: context?.timestamp ?? Date.now(),
      requestId: context?.requestId ?? 'stt-preview',
    };

    console.log('[STTInferenceEngine] Prediction executed', result.requestId);
    return result;
  }
}

export const sttInferenceEngine = new STTInferenceEngine();

