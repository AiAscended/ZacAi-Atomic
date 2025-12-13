/**
 * Convolutional-neural-network - Layer Implementations
 */

import { ModelPayload } from '../../shared/modelTypes';

export class CNNLayer {
  constructor(private readonly name: string) {}

  forward(input: ModelPayload): ModelPayload {
    return {
      ...input,
      lastLayer: this.name,
    };
  }
}

export const defaultCnnLayer = new CNNLayer('conv-1');

