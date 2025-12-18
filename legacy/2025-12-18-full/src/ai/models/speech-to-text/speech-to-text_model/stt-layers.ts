/**
 * Speech-to-text - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class STTLayer {
  forward(input: unknown): unknown {
    return input;
  }
}

export const defaultSttLayer = new STTLayer('stt-layer-1');

