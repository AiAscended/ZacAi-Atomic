/**
 * Text-to-speech - Layer Implementations
 */

import type { ModelPayload } from '../../shared/modelTypes';

export class TTSLayer {
  forward(input: unknown): unknown {
    return input;
  }
}

export const defaultTtsLayer = new TTSLayer('tts-layer-1');

