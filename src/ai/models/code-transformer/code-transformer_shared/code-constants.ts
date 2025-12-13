/**
 * Code-transformer - Constants
 */

import type { ModelConfig } from '../../shared/modelTypes';

export const CODE_VERSION = '1.0.0';

export const CODE_DEFAULT_CONFIG: ModelConfig = {
	encoderLayers: 12,
	decoderLayers: 12,
	embeddingSize: 1024,
	dropoutRate: 0.1,
};

