/**
 * Text-to-speech - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class TTSLayer {
  constructor(private readonly identifier: string) {}

  forward(input: ModelPayload): ModelPayload {
    return {
      ...input,
      lastLayer: this.identifier,
    };
  }
}

export const defaultTtsLayer = new TTSLayer('tts-layer-1');

