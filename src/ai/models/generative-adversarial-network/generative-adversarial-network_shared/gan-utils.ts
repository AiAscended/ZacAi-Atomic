/**
 * Generative-adversarial-network - Utilities
 */

import type { ModelPayload } from '../../shared/modelTypes';

export function seedLatentVector(payload: ModelPayload, seed = 'gan-seed'): ModelPayload {
	const seededPayload = {
		...payload,
		seed,
		seededAt: Date.now(),
	};

	console.log('[gan-utils] Seeded latent vector');
	return seededPayload;
}

export const ganBundle = { ganUtility }


export default ganBundle;
