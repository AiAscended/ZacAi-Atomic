/**
 * Evaluation helpers for LLM training.
 */

export function calculateAccuracy(predictions: number[], targets: number[]): number {
	if (!predictions.length || predictions.length !== targets.length) {
		return 0;
	}

	const correct = predictions.reduce((count, prediction, index) => (
		prediction === targets[index] ? count + 1 : count
	), 0);

	return correct / predictions.length;
}

