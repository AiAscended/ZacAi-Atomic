/**
 * LLM Sampling Algorithms
 * Various sampling strategies for text generation
 */

export class LLMSampling {
  /**
   * Greedy sampling - select highest probability token
   */
  greedy(logits: number[]): number {
    return logits.indexOf(Math.max(...logits));
  }

  /**
   * Top-K sampling
   */
  topK(logits: number[], k: number): number {
    const indexed = logits.map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => b.val - a.val);
    const topK = indexed.slice(0, k);
    const selected = topK[Math.floor(Math.random() * topK.length)];
    return selected.idx;
  }

  /**
   * Top-P (nucleus) sampling
   */
  topP(logits: number[], p: number): number {
    const probs = this.softmax(logits);
    const indexed = probs.map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => b.val - a.val);

    let cumSum = 0;
    const nucleus: typeof indexed = [];
    for (const item of indexed) {
      cumSum += item.val;
      nucleus.push(item);
      if (cumSum >= p) break;
    }

    const selected = nucleus[Math.floor(Math.random() * nucleus.length)];
    return selected.idx;
  }

  /**
   * Temperature sampling
   */
  temperature(logits: number[], temp: number): number {
    const scaledLogits = logits.map((l) => l / temp);
    const probs = this.softmax(scaledLogits);
    return this.sample(probs);
  }

  private softmax(logits: number[]): number[] {
    const maxLogit = Math.max(...logits);
    const exps = logits.map((l) => Math.exp(l - maxLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sumExps);
  }

  private sample(probs: number[]): number {
    const rand = Math.random();
    let cumSum = 0;
    for (let i = 0; i < probs.length; i++) {
      cumSum += probs[i];
      if (rand < cumSum) return i;
    }
    return probs.length - 1;
  }
}

export default LLMSampling;
