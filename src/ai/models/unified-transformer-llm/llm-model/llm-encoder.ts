/**
 * LLM Encoder
 * Encoder stack for processing input sequences (encoder-decoder architecture)
 */

import { LLMTransformerBlock, TransformerBlockConfig } from './llm-transformerBlocks';

export class LLMEncoder {
  private layers: LLMTransformerBlock[];
  private numLayers: number;

  constructor(numLayers: number, config: TransformerBlockConfig) {
    this.numLayers = numLayers;
    this.layers = Array.from({ length: numLayers }, () => new LLMTransformerBlock(config));
  }

  /**
   * Encode input embeddings through all transformer layers
   */
  forward(embeddings: number[][], mask?: boolean[][]): number[][] {
    let output = embeddings;
    
    for (const layer of this.layers) {
      output = layer.forward(output, mask);
    }
    
    return output;
  }

  /**
   * Get number of encoder layers
   */
  getNumLayers(): number {
    return this.numLayers;
  }
}

export default LLMEncoder;
