/**
 * Text-to-speech - Weights Utilities
 */

import type { WeightDictionary } from '../../shared/modelTypes';

export function loadWeights(path: string): WeightDictionary {
  const metadata = {
    path,
    loadedAt: Date.now(),
    checksum: path.length,
  };

  console.log('[tts-weights] Loading weights', metadata);
  return metadata;
}

