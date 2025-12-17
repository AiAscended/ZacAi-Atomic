/**
 * Speech-to-text - Constants
 */

import type { ModelConfig } from '../../shared/modelTypes';

export const STT_VERSION = '1.0.0';

export const STT_DEFAULT_CONFIG: ModelConfig = {
	samplingRate: 16000,
	encoderLayers: 6,
	decoderLayers: 4,
	language: 'en-US',
};

