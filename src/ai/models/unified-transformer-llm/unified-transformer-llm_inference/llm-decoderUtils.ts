/**
 * Utility helpers for decoder inference flows.
 */

export function beamSearch(logits: Float32Array[], beamSize: number = 5): number[] {
	if (!logits.length) {
		return [];
	}

	const lastStep = logits[logits.length - 1];
	const scoredTokens = Array.from(lastStep).map((score, idx) => ({ idx, score }));

	const topTokens = scoredTokens
		.sort((a, b) => b.score - a.score)
		.slice(0, Math.max(1, beamSize));

	return topTokens.map(token => token.idx);
}

