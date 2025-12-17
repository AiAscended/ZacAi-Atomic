/**
 * Unified Transformer LLM - Loss Function
 * Computes training loss (cross-entropy)
 */

/**
 * Cross-entropy loss for language modeling
 */
export function crossEntropyLoss(
  logits: Float32Array,
  targetTokenId: number
): number {
  // Apply softmax
  const maxLogit = Math.max(...Array.from(logits));
  const expLogits = logits.map(x => Math.exp(x - maxLogit));
  const sumExp = expLogits.reduce((a, b) => a + b, 0);
  const probs = expLogits.map(x => x / sumExp);
  
  // Negative log-likelihood
  const targetProb = probs[targetTokenId];
  return -Math.log(targetProb + 1e-10);
}

/**
 * Batch cross-entropy loss
 */
export function batchCrossEntropyLoss(
  batchLogits: Float32Array[],
  batchTargets: number[]
): number {
  if (batchLogits.length !== batchTargets.length) {
    throw new Error('Batch size mismatch');
  }
  
  let totalLoss = 0;
  for (let i = 0; i < batchLogits.length; i++) {
    totalLoss += crossEntropyLoss(batchLogits[i], batchTargets[i]);
  }
  
  return totalLoss / batchLogits.length;
}

/**
 * Perplexity metric
 */
export function perplexity(loss: number): number {
  return Math.exp(loss);
}

const llmLossFunction = {
  crossEntropyLoss,
  batchCrossEntropyLoss,
  perplexity,
};

export default llmLossFunction;
