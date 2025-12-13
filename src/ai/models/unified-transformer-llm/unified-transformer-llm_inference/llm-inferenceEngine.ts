/**
 * LLM Inference Engine
 * Performs inference and forward passes for text generation
 */

import { LLMTokenizer } from '../unified-transformer-llm_model/llm-tokenizer';
import { LLMEmbedding } from '../unified-transformer-llm_model/llm-embedding';
import { LLMDecoder } from '../unified-transformer-llm_model/llm-decoder';
import { LLMOutputHead } from '../unified-transformer-llm_model/llm-outputHead';
import type { LLMModelConfig } from '../unified-transformer-llm_config/llm-modelConfig';

type DecoderLayerWeights = ReturnType<LLMDecoder['getLayerWeights']>;
type OutputHeadWeights = ReturnType<LLMOutputHead['getWeights']>;

interface LLMWeightsMetadata {
  config: LLMModelConfig;
  trainedEpochs: number;
  trainedSteps: number;
  timestamp: string;
}

export interface LLMWeightsSnapshot {
  embeddings: number[][];
  decoderLayers: DecoderLayerWeights;
  outputHead: OutputHeadWeights;
}

export interface LLMWeightsExport extends LLMWeightsSnapshot {
  metadata: LLMWeightsMetadata;
}

export class LLMInferenceEngine {
  private config: LLMModelConfig;
  private tokenizer: LLMTokenizer;
  private embedding: LLMEmbedding;
  private decoder: LLMDecoder;
  private outputHead: LLMOutputHead;

  constructor(config: LLMModelConfig) {
    this.config = config;
    this.tokenizer = new LLMTokenizer();
    this.embedding = new LLMEmbedding(config.vocabSize, config.embeddingDim);
    this.decoder = new LLMDecoder(config.numLayers, {
      embeddingDim: config.embeddingDim,
      numHeads: config.numHeads,
      hiddenDim: config.hiddenDim,
      dropoutRate: 0.1,
    });
    this.outputHead = new LLMOutputHead(config.embeddingDim, config.vocabSize);
  }

  /**
   * Generate text from a prompt using autoregressive sampling
   * @param prompt Input text to continue
   * @param maxTokens Maximum number of tokens to generate (default: 50)
   * @param temperature Sampling temperature (default: 1.0, higher = more random)
   * @param topK Top-k sampling parameter (default: 50, 0 = disabled)
   * @param topP Nucleus sampling parameter (default: 0.9, 1.0 = disabled)
   * @returns Generated text
   */
  async generate(
    prompt: string, 
    maxTokens: number = 50,
    temperature: number = 1.0,
    topK: number = 50,
    topP: number = 0.9
  ): Promise<string> {
    // Encode prompt to token IDs
    const tokenIds = this.tokenizer.encode(prompt);
    const eosTokenId = 2; // End of sequence token
    const maxLength = tokenIds.length + maxTokens;
    
    // Autoregressive generation loop
    for (let step = 0; step < maxTokens; step++) {
      // Stop if we've reached max length
      if (tokenIds.length >= maxLength) {
        break;
      }
      
      // Forward pass through model
      const embeddings = this.embedding.forwardSequence(tokenIds);
      const hiddenStates = this.decoder.forward(embeddings, true); // Use causal mask
      const logits = this.outputHead.forward(hiddenStates);
      
      // Get logits for last token (next token prediction)
      const lastLogits = logits[logits.length - 1];
      
      // Sample next token
      const nextTokenId = this.sampleToken(lastLogits, temperature, topK, topP);
      
      // Stop if EOS token is generated
      if (nextTokenId === eosTokenId) {
        break;
      }
      
      // Append to sequence
      tokenIds.push(nextTokenId);
    }
    
    // Decode tokens back to text
    return this.tokenizer.decode(tokenIds);
  }
  
  /**
   * Sample a token from logits using temperature, top-k, and top-p (nucleus) sampling
   */
  private sampleToken(
    logits: number[],
    temperature: number,
    topK: number,
    topP: number
  ): number {
    // Apply temperature scaling
    const scaledLogits = logits.map(l => l / temperature);
    
    // Convert logits to probabilities with softmax
    const maxLogit = Math.max(...scaledLogits);
    const expLogits = scaledLogits.map(l => Math.exp(l - maxLogit));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    let probs = expLogits.map(e => e / sumExp);
    
    // Apply top-k filtering
    if (topK > 0 && topK < probs.length) {
      const topKIndices = probs
        .map((p, idx) => ({ prob: p, idx }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, topK)
        .map(item => item.idx);
      
      const filteredProbs = new Array(probs.length).fill(0);
      topKIndices.forEach(idx => filteredProbs[idx] = probs[idx]);
      probs = filteredProbs;
      
      // Renormalize
      const sum = probs.reduce((a, b) => a + b, 0);
      probs = probs.map(p => p / sum);
    }
    
    // Apply top-p (nucleus) sampling
    if (topP < 1.0) {
      const sorted = probs
        .map((p, idx) => ({ prob: p, idx }))
        .sort((a, b) => b.prob - a.prob);
      
      let cumulativeProb = 0;
      const nucleusIndices: number[] = [];
      
      for (const item of sorted) {
        cumulativeProb += item.prob;
        nucleusIndices.push(item.idx);
        if (cumulativeProb >= topP) {
          break;
        }
      }
      
      const filteredProbs = new Array(probs.length).fill(0);
      nucleusIndices.forEach(idx => filteredProbs[idx] = probs[idx]);
      probs = filteredProbs;
      
      // Renormalize
      const sum = probs.reduce((a, b) => a + b, 0);
      probs = probs.map(p => p / sum);
    }
    
    // Sample from the distribution
    const randomValue = Math.random();
    let cumulativeProb = 0;
    
    for (let i = 0; i < probs.length; i++) {
      cumulativeProb += probs[i];
      if (randomValue <= cumulativeProb) {
        return i;
      }
    }
    
    // Fallback to last token (should rarely happen)
    return probs.length - 1;
  }

  /**
   * Compute embeddings for text
   */
  async embed(text: string): Promise<number[]> {
    const tokenIds = this.tokenizer.encode(text);
    const embeddings = this.embedding.forwardSequence(tokenIds);
    
    // Return mean pooling
    const meanEmbedding = new Array(this.config.embeddingDim).fill(0);
    for (const emb of embeddings) {
      for (let i = 0; i < this.config.embeddingDim; i++) {
        meanEmbedding[i] += emb[i];
      }
    }
    return meanEmbedding.map(v => v / embeddings.length);
  }
  
  /**
   * Get all model weights (for saving)
   */
  getWeights(): LLMWeightsExport {
    const metadata: LLMWeightsMetadata = {
      config: this.config,
      trainedEpochs: 0,
      trainedSteps: 0,
      timestamp: new Date().toISOString(),
    };

    return {
      embeddings: this.embedding.getEmbeddings(),
      decoderLayers: this.decoder.getLayerWeights(),
      outputHead: this.outputHead.getWeights(),
      metadata,
    };
  }
  
  /**
   * Load weights into model
   */
  loadWeights(weights: LLMWeightsSnapshot): void {
    this.embedding.setEmbeddings(weights.embeddings);
    this.decoder.setLayerWeights(weights.decoderLayers);
    this.outputHead.setWeights(weights.outputHead);
  }
  
  /**
   * Get tokenizer for external use
   */
  getTokenizer(): LLMTokenizer {
    return this.tokenizer;
  }
}

export default LLMInferenceEngine;
