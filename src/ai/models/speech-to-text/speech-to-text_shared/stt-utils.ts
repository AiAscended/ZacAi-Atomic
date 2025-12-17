/**
 * Speech-to-text - Utilities
 */

import type { ModelPayload } from '../../shared/modelTypes';

export function normalizeAudioFeatures(payload: ModelPayload): ModelPayload {
	const length = payload.audioLengthMs ?? 0;
	const normalized = {
		...payload,
		normalized: true,
		audioLengthMs: length,
	};

	console.log('[stt-utils] Normalized audio payload', length);
	return normalized;
}

export const sttUtils = { sttUtility }

const sttUtils = { sttUtility }; 

export default sttUtils;
