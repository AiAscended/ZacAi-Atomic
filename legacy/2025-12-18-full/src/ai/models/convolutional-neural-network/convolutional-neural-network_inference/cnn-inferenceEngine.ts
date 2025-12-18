/**
 * Convolutional-neural-network - Inference Engine
 */

import { InferenceContext, ModelPayload } from '../../shared/modelTypes';

export class CNNInferenceEngine {
  predict(input: unknown): unknown {
    return input;
  }
}

export const cnnInferenceEngine = new CNNInferenceEngine();

