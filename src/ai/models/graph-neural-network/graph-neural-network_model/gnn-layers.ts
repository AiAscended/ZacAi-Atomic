/**
 * Graph-neural-network - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class GNNLayer {
  forward(input: unknown): unknown {
    return input;
  }
}

export const defaultGnnLayer = new GNNLayer('gnn-layer-1');

