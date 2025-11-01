/**
 * Embedding Layer
 * 
 * Converts tokens into vector embeddings with positional encoding.
 */

import { LLMConfig } from './config';

export class Embedding {
  private config: LLMConfig;
  private tokenEmbeddings: Float32Array[];
  private positionEmbeddings: Float32Array[];
  
  constructor(config: LLMConfig) {
    this.config = config;
    this.tokenEmbeddings = [];
    this.positionEmbeddings = [];
    this.initializeEmbeddings();
  }
  
  /**
   * Initialize embedding matrices
   */
  private initializeEmbeddings(): void {
    // Initialize token embeddings
    for (let i = 0; i < this.config.vocabSize; i++) {
      this.tokenEmbeddings.push(
        this.randomEmbedding(this.config.embeddingDim)
      );
    }
    
    // Initialize positional embeddings
    for (let i = 0; i < this.config.maxSequenceLength; i++) {
      this.positionEmbeddings.push(
        this.generatePositionalEncoding(i, this.config.embeddingDim)
      );
    }
  }
  
  /**
   * Generate random embedding vector
   */
  private randomEmbedding(dim: number): Float32Array {
    const embedding = new Float32Array(dim);
    const scale = Math.sqrt(2.0 / dim);
    
    for (let i = 0; i < dim; i++) {
      embedding[i] = (Math.random() - 0.5) * 2 * scale;
    }
    
    return embedding;
  }
  
  /**
   * Generate sinusoidal positional encoding
   */
  private generatePositionalEncoding(position: number, dim: number): Float32Array {
    const encoding = new Float32Array(dim);
    
    for (let i = 0; i < dim; i++) {
      const angle = position / Math.pow(10000, (2 * i) / dim);
      encoding[i] = i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
    }
    
    return encoding;
  }
  
  /**
   * Forward pass: Convert token IDs to embeddings
   */
  forward(tokenIds: number[]): Float32Array[] {
    const embeddings: Float32Array[] = [];
    
    for (let pos = 0; pos < tokenIds.length; pos++) {
      const tokenId = tokenIds[pos];
      const tokenEmb = this.tokenEmbeddings[tokenId];
      const posEmb = this.positionEmbeddings[pos];
      
      // Add token and positional embeddings
      const combined = new Float32Array(this.config.embeddingDim);
      for (let i = 0; i < this.config.embeddingDim; i++) {
        combined[i] = tokenEmb[i] + posEmb[i];
      }
      
      embeddings.push(combined);
    }
    
    return embeddings;
  }
  
  /**
   * Get embedding for a specific token
   */
  getTokenEmbedding(tokenId: number): Float32Array {
    return this.tokenEmbeddings[tokenId];
  }
  
  /**
   * Get positional encoding for a specific position
   */
  getPositionalEncoding(position: number): Float32Array {
    return this.positionEmbeddings[position];
  }
}
