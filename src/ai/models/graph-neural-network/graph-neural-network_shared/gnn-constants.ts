/**
 * Graph-neural-network - Constants
 */

import type { ModelConfig } from '../../shared/modelTypes';

export const GNN_VERSION = '1.0.0';

export const GNN_DEFAULT_CONFIG: ModelConfig = {
	messagePassingSteps: 3,
	embeddingSize: 256,
	learningRate: 0.0003,
};

