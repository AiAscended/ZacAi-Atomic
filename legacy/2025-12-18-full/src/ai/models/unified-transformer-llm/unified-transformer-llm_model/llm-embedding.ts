/**
 * LLM Embedding Layer
 * Converts token IDs into dense vector embeddings
 */

export class LLMEmbedding {
  private vocabSize: number;
  private embeddingDim: number;
  private embeddings: number[][];

  constructor(vocabSize: number, embeddingDim: number) {
    this.vocabSize = vocabSize;
    this.embeddingDim = embeddingDim;
    this.embeddings = this.initializeEmbeddings();
  }

  /**
   * Initialize embedding matrix with random values
   */
  private initializeEmbeddings(): number[][] {
    const embeddings: number[][] = [];
    for (let i = 0; i < this.vocabSize; i++) {
      const embedding: number[] = [];
      for (let j = 0; j < this.embeddingDim; j++) {
        embedding.push((Math.random() - 0.5) * 0.1);
      }
      embeddings.push(embedding);
    }
    return embeddings;
  }

  /**
   * Get embedding vector for a token ID
   */
  forward(tokenId: number): number[] {
    if (tokenId < 0 || tokenId >= this.vocabSize) {
      throw new Error(
        `Token ID ${tokenId} out of range [0, ${this.vocabSize})`,
      );
    }
    return [...this.embeddings[tokenId]];
  }

  /**
   * Get embeddings for a sequence of token IDs
   */
  forwardSequence(tokenIds: number[]): number[][] {
    return tokenIds.map((id) => this.forward(id));
  }

  /**
   * Update embedding for a specific token
   */
  updateEmbedding(tokenId: number, newEmbedding: number[]): void {
    if (newEmbedding.length !== this.embeddingDim) {
      throw new Error(
        `Embedding dimension mismatch: expected ${this.embeddingDim}, got ${newEmbedding.length}`,
      );
    }
    this.embeddings[tokenId] = [...newEmbedding];
  }

  /**
   * Get all embeddings (for saving)
   */
  getEmbeddings(): number[][] {
    return this.embeddings.map((emb) => [...emb]);
  }

  /**
   * Set all embeddings (for loading)
   */
  setEmbeddings(embeddings: number[][]): void {
    if (embeddings.length !== this.vocabSize) {
      throw new Error(
        `Vocab size mismatch: expected ${this.vocabSize}, got ${embeddings.length}`,
      );
    }
    if (embeddings[0].length !== this.embeddingDim) {
      throw new Error(
        `Embedding dim mismatch: expected ${this.embeddingDim}, got ${embeddings[0].length}`,
      );
    }
    this.embeddings = embeddings.map((emb) => [...emb]);
  }
}

export default LLMEmbedding;
