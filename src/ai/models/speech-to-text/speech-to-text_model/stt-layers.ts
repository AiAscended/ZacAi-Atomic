/**
 * Speech-to-text - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class STTLayer {
  constructor(private readonly identifier: string) {}

  forward(input: ModelPayload): ModelPayload {
    return {
      ...input,
      lastLayer: this.identifier,
    };
  }
}

export const defaultSttLayer = new STTLayer('stt-layer-1');

