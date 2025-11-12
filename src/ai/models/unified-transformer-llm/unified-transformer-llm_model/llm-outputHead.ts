/**
 * Unified Transformer LLM - Output Head
 * Maps hidden states to output token logits
 */

export class LLMOutputHead {
  private embeddingDim: number;
  private vocabSize: number;
  private weights: number[][];

  constructor(embeddingDim: number, vocabSize: number) {
    this.embeddingDim = embeddingDim;
    this.vocabSize = vocabSize;
    this.weights = this.initializeWeights();
  }

  /**
   * Initialize output projection weights
   */
  private initializeWeights(): number[][] {
    const weights: number[][] = [];
    for (let i = 0; i < this.vocabSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < this.embeddingDim; j++) {
        row.push((Math.random() - 0.5) * 0.1);
      }
      weights.push(row);
    }
    return weights;
  }

  /**
   * Project hidden states to vocabulary logits
   */
  forward(hiddenStates: number[][]): number[][] {
    return hiddenStates.map(hidden => {
      const logits: number[] = [];
      for (let i = 0; i < this.vocabSize; i++) {
        let logit = 0;
        for (let j = 0; j < this.embeddingDim; j++) {
          logit += hidden[j] * this.weights[i][j];
        }
        logits.push(logit);
      }
      return logits;
    });
  }

  /**
   * Apply softmax to convert logits to probabilities
   */
  softmax(logits: number[]): number[] {
    const maxLogit = Math.max(...logits);
    const exps = logits.map(l => Math.exp(l - maxLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sumExps);
  }

  /**
   * Get predicted token ID from logits
   */
  getPrediction(logits: number[]): number {
    const probs = this.softmax(logits);
    return probs.indexOf(Math.max(...probs));
  }
  
  /**
   * Get weight matrices (for saving)
   */
  getWeights(): { W: number[][], b: number[] } {
    return {
      W: this.weights,
      b: new Array(this.vocabSize).fill(0), // Placeholder for bias
    };
  }
  
  /**
   * Set weight matrices (for loading)
   */
  setWeights(weights: { W: number[][], b: number[] }): void {
    this.weights = weights.W;
    // Note: bias not currently used in forward pass, but stored for future use
  }
}

export default LLMOutputHead;
