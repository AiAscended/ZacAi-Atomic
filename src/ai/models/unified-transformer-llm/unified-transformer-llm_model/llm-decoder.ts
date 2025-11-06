/**
 * LLM Decoder
 * Decoder stack for autoregressive text generation
 */

import { LLMTransformerBlock, TransformerBlockConfig } from './llm-transformerBlocks';

export class LLMDecoder {
  private layers: LLMTransformerBlock[];
  private numLayers: number;

  constructor(numLayers: number, config: TransformerBlockConfig) {
    this.numLayers = numLayers;
    this.layers = Array.from({ length: numLayers }, () => new LLMTransformerBlock(config));
  }

  /**
   * Create causal mask for autoregressive generation
   */
  private createCausalMask(seqLength: number): boolean[][] {
    const mask: boolean[][] = [];
    for (let i = 0; i < seqLength; i++) {
      const row: boolean[] = [];
      for (let j = 0; j < seqLength; j++) {
        row.push(j <= i); // Can only attend to current and previous positions
      }
      mask.push(row);
    }
    return mask;
  }

  /**
   * Decode through all transformer layers with causal masking
   */
  forward(embeddings: number[][], useCausalMask: boolean = true): number[][] {
    let output = embeddings;
    const mask = useCausalMask ? this.createCausalMask(embeddings.length) : undefined;
    
    for (const layer of this.layers) {
      output = layer.forward(output, mask);
    }
    
    return output;
  }

  /**
   * Get number of decoder layers
   */
  getNumLayers(): number {
    return this.numLayers;
  }
  
  /**
   * Get all layer weights (for saving)
   */
  getLayerWeights() {
    return this.layers.map(layer => layer.getWeights());
  }
  
  /**
   * Set all layer weights (for loading)
   */
  setLayerWeights(layerWeights: Array<ReturnType<typeof this.layers[0]['getWeights']>>): void {
    if (layerWeights.length !== this.numLayers) {
      throw new Error(`Layer count mismatch: expected ${this.numLayers}, got ${layerWeights.length}`);
    }
    this.layers.forEach((layer, i) => layer.setWeights(layerWeights[i]));
  }
}

export default LLMDecoder;
