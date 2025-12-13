/**
 * Convolutional-neural-network - Constants
 */

import { ModelConfig } from '../../shared/modelTypes';

export const CNN_VERSION = '1.0.0';

export const CNN_DEFAULT_CONFIG: ModelConfig = {
	layers: 5,
	learningRate: 0.0005,
	optimizer: 'adam',
};

