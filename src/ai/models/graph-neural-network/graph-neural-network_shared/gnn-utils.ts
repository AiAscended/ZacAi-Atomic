/**
 * Graph-neural-network - Utilities
 */

import type { ModelPayload } from '../../shared/modelTypes';

export function normalizeGraphFeatures(payload: ModelPayload): ModelPayload {
	const featureCount = Object.keys(payload).length;
	const normalized = {
		...payload,
		normalized: true,
		featureCount,
	};

	console.log('[gnn-utils] Normalized graph payload', featureCount);
	return normalized;
}

export const gnnBundle = { gnnUtility }

const gnnBundle = { gnnUtility }; 

export default gnnBundle;
