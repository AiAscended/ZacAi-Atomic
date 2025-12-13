/**
 * Generative-adversarial-network - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class GANLayer {
  constructor(private readonly identifier: string) {}

  forward(input: ModelPayload): ModelPayload {
    return {
      ...input,
      lastLayer: this.identifier,
    };
  }
}

export const defaultGanLayer = new GANLayer('gan-layer-1');

