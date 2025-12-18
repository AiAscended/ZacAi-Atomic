/**
 * Text-to-speech - Inference Engine
 */

import type { InferenceContext, ModelPayload } from '../../shared/modelTypes';

export class TTSInferenceEngine {
  predict(input: unknown): unknown {
    return input;
  }
}

export const ttsInferenceEngine = new TTSInferenceEngine();

