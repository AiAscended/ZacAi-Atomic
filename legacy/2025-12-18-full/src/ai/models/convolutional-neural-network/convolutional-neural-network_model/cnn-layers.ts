/**
 * Convolutional-neural-network - Layer Implementations
 */

import { ModelPayload } from '../../shared/modelTypes';

export class CNNLayer {
  forward(input: unknown): unknown {
    return input;
  }
}

export const defaultCnnLayer = new CNNLayer('conv-1');

