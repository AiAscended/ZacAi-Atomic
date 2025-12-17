/**
 * Text-to-speech - Utilities
 */

import type { ModelPayload } from '../../shared/modelTypes';

export function synthesizePhonemes(payload: ModelPayload): ModelPayload {
	const phonemeSequence = (payload.text as string | undefined)?.split(' ') ?? [];
	const annotated = {
		...payload,
		phonemeSequence,
		synthesizedAt: Date.now(),
	};

	console.log('[tts-utils] Generated phoneme sequence', phonemeSequence.length);
	return annotated;
}

export const ttsUtils = { ttsUtility }


export default ttsUtils;
