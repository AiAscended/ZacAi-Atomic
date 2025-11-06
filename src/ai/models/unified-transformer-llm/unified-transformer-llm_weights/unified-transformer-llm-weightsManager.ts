/**
 * LLM Weights Manager
 * Handles saving, loading, and managing model weights for persistence and training
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { LLMModelConfig } from '../llm-config/llm-modelConfig';

export interface ModelWeights {
  // Embedding weights
  embeddings: number[][]; // [vocabSize, embeddingDim]
  
  // Decoder layer weights (array of transformer blocks)
  decoderLayers: Array<{
    // Attention weights
    Wq: number[][][]; // [numHeads, embeddingDim, headDim]
    Wk: number[][][]; // [numHeads, embeddingDim, headDim]
    Wv: number[][][]; // [numHeads, embeddingDim, headDim]
    Wo: number[][]; // [embeddingDim, embeddingDim]
    
    // Feed-forward weights
    W1: number[][]; // [embeddingDim, hiddenDim]
    b1: number[]; // [hiddenDim]
    W2: number[][]; // [hiddenDim, embeddingDim]
    b2: number[]; // [embeddingDim]
    
    // Layer normalization parameters
    gamma1: number[]; // [embeddingDim]
    beta1: number[]; // [embeddingDim]
    gamma2: number[]; // [embeddingDim]
    beta2: number[]; // [embeddingDim]
  }>;
  
  // Output head weights
  outputHead: {
    W: number[][]; // [embeddingDim, vocabSize]
    b: number[]; // [vocabSize]
  };
  
  // Metadata
  metadata: {
    config: LLMModelConfig;
    trainedEpochs: number;
    trainedSteps: number;
    lastLoss?: number;
    timestamp: string;
  };
}

export class LLMWeightsManager {
  private weightsDir: string;
  
  constructor(weightsDir?: string) {
    this.weightsDir = weightsDir || path.join(__dirname, '../../../data/weights/llm');
  }
  
  /**
   * Save model weights to disk
   */
  async saveWeights(weights: ModelWeights, filename: string = 'model_weights.json'): Promise<void> {
    try {
      // Ensure weights directory exists
      await fs.mkdir(this.weightsDir, { recursive: true });
      
      const filepath = path.join(this.weightsDir, filename);
      
      // Add timestamp to metadata
      weights.metadata.timestamp = new Date().toISOString();
      
      // Convert to JSON and save
      const json = JSON.stringify(weights, null, 2);
      await fs.writeFile(filepath, json, 'utf-8');
      
      console.log(`✅ Model weights saved to: ${filepath}`);
      console.log(`   - Layers: ${weights.decoderLayers.length}`);
      console.log(`   - Vocab size: ${weights.embeddings.length}`);
      console.log(`   - Embedding dim: ${weights.embeddings[0]?.length || 0}`);
    } catch (error) {
      console.error(`❌ Failed to save weights: ${error}`);
      throw new Error(`Failed to save model weights: ${error}`);
    }
  }
  
  /**
   * Load model weights from disk
   */
  async loadWeights(filename: string = 'model_weights.json'): Promise<ModelWeights> {
    try {
      const filepath = path.join(this.weightsDir, filename);
      
      // Read and parse JSON
      const json = await fs.readFile(filepath, 'utf-8');
      const weights = JSON.parse(json) as ModelWeights;
      
      console.log(`✅ Model weights loaded from: ${filepath}`);
      console.log(`   - Layers: ${weights.decoderLayers.length}`);
      console.log(`   - Vocab size: ${weights.embeddings.length}`);
      console.log(`   - Trained epochs: ${weights.metadata.trainedEpochs}`);
      console.log(`   - Last loss: ${weights.metadata.lastLoss?.toFixed(4) || 'N/A'}`);
      
      return weights;
    } catch (error) {
      console.error(`❌ Failed to load weights: ${error}`);
      throw new Error(`Failed to load model weights: ${error}`);
    }
  }
  
  /**
   * Save checkpoint during training
   */
  async saveCheckpoint(
    weights: ModelWeights,
    epoch: number,
    step: number,
    loss: number
  ): Promise<void> {
    const filename = `checkpoint_epoch${epoch}_step${step}.json`;
    
    // Update metadata
    weights.metadata.trainedEpochs = epoch;
    weights.metadata.trainedSteps = step;
    weights.metadata.lastLoss = loss;
    
    await this.saveWeights(weights, filename);
  }
  
  /**
   * Load the latest checkpoint
   */
  async loadLatestCheckpoint(): Promise<ModelWeights | null> {
    try {
      await fs.mkdir(this.weightsDir, { recursive: true });
      const files = await fs.readdir(this.weightsDir);
      
      // Find all checkpoint files
      const checkpoints = files.filter(f => f.startsWith('checkpoint_') && f.endsWith('.json'));
      
      if (checkpoints.length === 0) {
        console.log('No checkpoints found');
        return null;
      }
      
      // Sort by modification time (most recent first)
      const checkpointStats = await Promise.all(
        checkpoints.map(async (file) => ({
          file,
          mtime: (await fs.stat(path.join(this.weightsDir, file))).mtime,
        }))
      );
      
      checkpointStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      const latestCheckpoint = checkpointStats[0].file;
      
      console.log(`Loading latest checkpoint: ${latestCheckpoint}`);
      return await this.loadWeights(latestCheckpoint);
    } catch (error) {
      console.error(`Failed to load latest checkpoint: ${error}`);
      return null;
    }
  }
  
  /**
   * Initialize weights with random values (Xavier/Glorot initialization)
   */
  initializeWeights(config: LLMModelConfig): ModelWeights {
    console.log('Initializing random weights...');
    
    // Initialize embeddings
    const embeddings = this.initializeMatrix(config.vocabSize, config.embeddingDim);
    
    // Initialize decoder layers
    const decoderLayers = [];
    const headDim = Math.floor(config.embeddingDim / config.numHeads);
    
    for (let i = 0; i < config.numLayers; i++) {
      decoderLayers.push({
        // Attention weights
        Wq: this.initializeAttentionWeights(config.numHeads, config.embeddingDim, headDim),
        Wk: this.initializeAttentionWeights(config.numHeads, config.embeddingDim, headDim),
        Wv: this.initializeAttentionWeights(config.numHeads, config.embeddingDim, headDim),
        Wo: this.initializeMatrix(config.embeddingDim, config.embeddingDim),
        
        // Feed-forward weights
        W1: this.initializeMatrix(config.embeddingDim, config.hiddenDim),
        b1: new Array(config.hiddenDim).fill(0),
        W2: this.initializeMatrix(config.hiddenDim, config.embeddingDim),
        b2: new Array(config.embeddingDim).fill(0),
        
        // Layer norm parameters
        gamma1: new Array(config.embeddingDim).fill(1),
        beta1: new Array(config.embeddingDim).fill(0),
        gamma2: new Array(config.embeddingDim).fill(1),
        beta2: new Array(config.embeddingDim).fill(0),
      });
    }
    
    // Initialize output head
    const outputHead = {
      W: this.initializeMatrix(config.embeddingDim, config.vocabSize),
      b: new Array(config.vocabSize).fill(0),
    };
    
    return {
      embeddings,
      decoderLayers,
      outputHead,
      metadata: {
        config,
        trainedEpochs: 0,
        trainedSteps: 0,
        timestamp: new Date().toISOString(),
      },
    };
  }
  
  /**
   * Initialize attention weight matrices for all heads
   */
  private initializeAttentionWeights(numHeads: number, inDim: number, outDim: number): number[][][] {
    const weights: number[][][] = [];
    for (let h = 0; h < numHeads; h++) {
      weights.push(this.initializeMatrix(inDim, outDim));
    }
    return weights;
  }
  
  /**
   * Initialize a matrix with Xavier/Glorot uniform distribution
   */
  private initializeMatrix(rows: number, cols: number): number[][] {
    const limit = Math.sqrt(6 / (rows + cols));
    const matrix: number[][] = [];
    
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        row.push((Math.random() * 2 - 1) * limit);
      }
      matrix.push(row);
    }
    
    return matrix;
  }
  
  /**
   * Get list of all available checkpoints
   */
  async listCheckpoints(): Promise<string[]> {
    try {
      await fs.mkdir(this.weightsDir, { recursive: true });
      const files = await fs.readdir(this.weightsDir);
      return files.filter(f => f.startsWith('checkpoint_') && f.endsWith('.json'));
    } catch (error) {
      console.error(`Failed to list checkpoints: ${error}`);
      return [];
    }
  }
  
  /**
   * Delete old checkpoints, keeping only the N most recent
   */
  async cleanupCheckpoints(keepLast: number = 5): Promise<void> {
    try {
      const checkpoints = await this.listCheckpoints();
      
      if (checkpoints.length <= keepLast) {
        return;
      }
      
      // Sort by modification time
      const checkpointStats = await Promise.all(
        checkpoints.map(async (file) => ({
          file,
          mtime: (await fs.stat(path.join(this.weightsDir, file))).mtime,
        }))
      );
      
      checkpointStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      // Delete old checkpoints
      const toDelete = checkpointStats.slice(keepLast);
      for (const checkpoint of toDelete) {
        await fs.unlink(path.join(this.weightsDir, checkpoint.file));
        console.log(`Deleted old checkpoint: ${checkpoint.file}`);
      }
    } catch (error) {
      console.error(`Failed to cleanup checkpoints: ${error}`);
    }
  }
}

export default LLMWeightsManager;
