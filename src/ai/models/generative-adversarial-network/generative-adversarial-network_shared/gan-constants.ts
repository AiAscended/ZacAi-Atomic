/**
 * Generative-adversarial-network - Constants
 */

import type { ModelConfig } from '../../shared/modelTypes';

export const GAN_VERSION = '1.0.0';

export const GAN_DEFAULT_CONFIG: ModelConfig = {
	generatorLayers: 4,
	discriminatorLayers: 3,
	latentSize: 128,
};

