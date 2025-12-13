/**
 * Graph-neural-network - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class GNNLayer {
  constructor(private readonly identifier: string) {}

  forward(input: ModelPayload): ModelPayload {
    return {
      ...input,
      lastLayer: this.identifier,
    };
  }
}

export const defaultGnnLayer = new GNNLayer('gnn-layer-1');

