/**
 * Text-to-speech - Constants
 */

import type { ModelConfig } from '../../shared/modelTypes';

export const TTS_VERSION = '1.0.0';

export const TTS_DEFAULT_CONFIG: ModelConfig = {
	sampleRate: 22050,
	vocoder: 'griffin-lim',
	encoderLayers: 5,
	speakerEmbeddings: true,
};

