/**
 * Code-transformer - Utilities
 */

import type { ModelPayload } from '../../shared/modelTypes';

const codeBundle = { codeUtility }; // Removed duplicate export default

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
