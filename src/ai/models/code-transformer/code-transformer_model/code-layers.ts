/**
 * Code-transformer - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class CODELayer {
  constructor(private readonly identifier: string) {}

  forward(input: ModelPayload): ModelPayload {
    return {
      ...input,
      lastLayer: this.identifier,
    };
  }
}

export const defaultCodeLayer = new CODELayer('code-layer-1');

