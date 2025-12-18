/**
 * Graph-neural-network - Inference Engine
 */

import type { InferenceContext, ModelPayload } from '../../shared/modelTypes';

export class GNNInferenceEngine {
  predict(input: unknown): unknown {
    return input;
  }
}

export const gnnInferenceEngine = new GNNInferenceEngine();

