/**
 * Convolutional-neural-network - Weights Utilities
 */

import { WeightDictionary } from '../../shared/modelTypes';

export function loadWeights(path: string): WeightDictionary {
  console.log('[cnn-weights] Loading weights from path', path);
  return {
    path,
    loadedAt: Date.now(),
  };
}

