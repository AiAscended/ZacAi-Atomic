/**
 * Generative-adversarial-network - Inference Engine
 */

import type { InferenceContext, ModelPayload } from '../../shared/modelTypes';

export class GANInferenceEngine {
  predict(input: unknown): unknown {
    return input;
  }
}

export const ganInferenceEngine = new GANInferenceEngine();

