/**
 * Convolutional-neural-network - Utilities
 */

import { ModelPayload } from '../../shared/modelTypes';

export function normalizeInput(payload: ModelPayload): ModelPayload {
	const normalized = {
		...payload,
		normalized: true,
	};

	console.log('[cnn-utils] Normalized payload keys', Object.keys(payload).length);
	return normalized;
}

