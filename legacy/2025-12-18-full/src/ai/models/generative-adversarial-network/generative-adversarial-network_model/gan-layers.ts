/**
 * Generative-adversarial-network - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class GANLayer {
  forward(input: unknown): unknown {
    return input;
  }
}

export const defaultGanLayer = new GANLayer('gan-layer-1');

