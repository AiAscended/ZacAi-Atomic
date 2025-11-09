/**
 * Training Coordinator
 * Coordinates the training cycle using learned metrics
 * Flow: learnt.json → training data → model updates → weights
 */

import { LearningMetricsTracker } from '../monitoring/learningMetricsTracker';
import { LLMWeightsManager } from '../models/unified-transformer-llm/unified-transformer-llm_weights/unified-transformer-llm-weightsManager';
import type { InferenceMetrics } from '../monitoring/learningMetricsTracker';

export interface TrainingConfig {
  minConfidence: number; // Min confidence to use for training
  maxSamplesPerBatch: number; // Max samples per training batch
  learningRate: number; // Learning rate for updates
  epochs: number; // Number of training epochs
  validationSplit: number; // Percentage of data for validation
}

export interface TrainingResult {
  success: boolean;
  samplesUsed: number;
  initialLoss?: number;
  finalLoss?: number;
  epochsCompleted: number;
  weightsUpdated: boolean;
  error?: string;
}

export class TrainingCoordinator {
  private metricsTracker: LearningMetricsTracker;
  private weightsManager: LLMWeightsManager;
  private isTraining: boolean = false;
  
  constructor() {
    this.metricsTracker = new LearningMetricsTracker();
    this.weightsManager = new LLMWeightsManager();
  }
  
  /**
   * Check if enough data is available for training
   */
  async canTrain(minSamples: number = 10): Promise<boolean> {
    const unlearnedMetrics = await this.metricsTracker.getUnlearnedMetrics();
    return unlearnedMetrics.length >= minSamples;
  }
  
  /**
   * Run a training cycle
   */
  async trainFromMetrics(config?: Partial<TrainingConfig>): Promise<TrainingResult> {
    if (this.isTraining) {
      return {
        success: false,
        samplesUsed: 0,
        epochsCompleted: 0,
        weightsUpdated: false,
        error: 'Training already in progress',
      };
    }
    
    this.isTraining = true;
    
    try {
      // Set default config
      const trainingConfig: TrainingConfig = {
        minConfidence: config?.minConfidence ?? 0.7,
        maxSamplesPerBatch: config?.maxSamplesPerBatch ?? 100,
        learningRate: config?.learningRate ?? 0.0001,
        epochs: config?.epochs ?? 1,
        validationSplit: config?.validationSplit ?? 0.1,
      };
      
      console.log('🎓 Starting training cycle...');
      console.log(`   Config:`, trainingConfig);
      
      // Step 1: Export high-quality metrics
      const metrics = await this.metricsTracker.exportForTraining(
        trainingConfig.minConfidence,
        trainingConfig.maxSamplesPerBatch
      );
      
      if (metrics.length === 0) {
        return {
          success: false,
          samplesUsed: 0,
          epochsCompleted: 0,
          weightsUpdated: false,
          error: 'No high-quality samples available for training',
        };
      }
      
      console.log(`   ✅ Found ${metrics.length} high-quality samples`);
      
      // Step 2: Prepare training data
      const trainingData = this.prepareTrainingData(metrics);
      console.log(`   ✅ Prepared ${trainingData.length} training examples`);
      
      // Step 3: Load current weights (or initialize if none exist)
      try {
        (await this.weightsManager.loadLatestCheckpoint()) || 
        (await this.weightsManager.loadWeights());
        // In real implementation, would use loaded weights for training
        console.log('   ✅ Loaded existing weights');
      } catch (error) {
        console.log('   ℹ️  No existing weights found, would initialize new weights');
        // In real implementation, would initialize weights here
      }
      
      // Step 4: Simulate training (placeholder for actual training loop)
      const result = await this.simulateTraining(metrics, trainingConfig);
      
      // Step 5: Mark metrics as learned
      if (result.success) {
        const timestamps = metrics.map(m => m.timestamp);
        await this.metricsTracker.markAsLearned(timestamps);
        console.log(`   ✅ Marked ${timestamps.length} samples as learned`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Training failed:', error);
      return {
        success: false,
        samplesUsed: 0,
        epochsCompleted: 0,
        weightsUpdated: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      this.isTraining = false;
    }
  }
  
  /**
   * Prepare training data from metrics
   */
  private prepareTrainingData(metrics: InferenceMetrics[]): Array<{
    input: string;
    target: string;
    weight: number;
  }> {
    return metrics.map(m => ({
      input: m.prompt,
      target: m.response,
      weight: m.confidence, // Use confidence as sample weight
    }));
  }
  
  /**
   * Simulate training (placeholder for actual training logic)
   * TODO: Implement real training loop with:
   * - Forward pass
   * - Loss calculation
   * - Backward pass (gradients)
   * - Weight updates
   */
  private async simulateTraining(
    metrics: InferenceMetrics[],
    config: TrainingConfig
  ): Promise<TrainingResult> {
    console.log('   🔄 Running training simulation...');
    
    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Calculate mock loss (decreasing over epochs)
    const initialLoss = 2.5;
    const lossReduction = 0.3 * (metrics.length / config.maxSamplesPerBatch);
    const finalLoss = Math.max(0.5, initialLoss - lossReduction);
    
    console.log(`   📊 Initial loss: ${initialLoss.toFixed(4)}`);
    console.log(`   📊 Final loss: ${finalLoss.toFixed(4)}`);
    console.log(`   ✅ Training complete (simulated)`);
    
    return {
      success: true,
      samplesUsed: metrics.length,
      initialLoss,
      finalLoss,
      epochsCompleted: config.epochs,
      weightsUpdated: false, // Would be true with real training
    };
  }
  
  /**
   * Get training status
   */
  getStatus(): {
    isTraining: boolean;
    metrics: {
      totalSamples?: number;
      unlearnedSamples?: number;
    };
  } {
    return {
      isTraining: this.isTraining,
      metrics: {}, // Would be populated with real data
    };
  }
  
  /**
   * Schedule automatic training when enough data is available
   */
  async scheduleAutoTraining(
    checkIntervalMs: number = 60000, // Check every minute
    minSamples: number = 50
  ): Promise<void> {
    setInterval(async () => {
      if (await this.canTrain(minSamples)) {
        console.log(`\n🎓 Auto-training triggered (${minSamples}+ samples available)\n`);
        const result = await this.trainFromMetrics();
        console.log('🎓 Auto-training result:', result);
      }
    }, checkIntervalMs);
    
    console.log(`✅ Auto-training scheduled (check interval: ${checkIntervalMs}ms, min samples: ${minSamples})`);
  }
}

export default TrainingCoordinator;
