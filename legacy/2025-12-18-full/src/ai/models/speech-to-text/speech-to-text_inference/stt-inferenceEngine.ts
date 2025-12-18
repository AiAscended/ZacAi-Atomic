/**
 * Speech-to-text - Inference Engine
 */

import type { InferenceContext, ModelPayload } from '../../shared/modelTypes';

export class STTInferenceEngine {
  predict(input: unknown): unknown {
    return input;
  }
}

export const sttInferenceEngine = new STTInferenceEngine();

