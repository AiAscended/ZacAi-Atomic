/**
 * Code-transformer - Utilities
 */

import type { ModelPayload } from '../../shared/modelTypes';

export function sanitizeCodeSnippet(payload: ModelPayload): ModelPayload {
	const snippet = (payload.snippet as string | undefined) ?? '';
	const sanitized = snippet.trim().replace(/\s+/g, ' ');

	const result = {
		...payload,
		snippet: sanitized,
		sanitizedAt: Date.now(),
	};

	console.log('[code-utils] Sanitized snippet length', sanitized.length);
	return result;
}

export const codeBundle = { codeUtility }

export default codeBundle
