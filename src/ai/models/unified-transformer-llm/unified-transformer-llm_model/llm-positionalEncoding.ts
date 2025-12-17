/**
 * LLM Positional Encoding
 * Adds positional information to token embeddings
 */

export class LLMPositionalEncoding {
  private maxSeqLength: number;
  private embeddingDim: number;
  private encodings: number[][];

  constructor(maxSeqLength: number, embeddingDim: number) {
    this.maxSeqLength = maxSeqLength;
    this.embeddingDim = embeddingDim;
    this.encodings = this.generateEncodings();
  }

  /**
   * Generate sinusoidal positional encodings
   */
  private generateEncodings(): number[][] {
    const encodings: number[][] = [];

    for (let pos = 0; pos < this.maxSeqLength; pos++) {
      const encoding: number[] = [];
      for (let i = 0; i < this.embeddingDim; i++) {
        const angle =
          pos / Math.pow(10000, (2 * Math.floor(i / 2)) / this.embeddingDim);
        encoding.push(i % 2 === 0 ? Math.sin(angle) : Math.cos(angle));
      }
      encodings.push(encoding);
    }

    return encodings;
  }

  /**
   * Add positional encoding to embeddings
   */
  forward(embeddings: number[][]): number[][] {
    if (embeddings.length > this.maxSeqLength) {
      throw new Error(
        `Sequence length ${embeddings.length} exceeds maximum ${this.maxSeqLength}`,
      );
    }

    return embeddings.map((embedding, pos) => {
      const posEncoding = this.encodings[pos];
      return embedding.map((val, i) => val + posEncoding[i]);
    });
  }
}

export default LLMPositionalEncoding;
