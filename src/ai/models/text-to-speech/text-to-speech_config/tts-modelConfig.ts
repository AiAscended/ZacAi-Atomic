/**
 * Text-to-speech - Model Configuration
 * Defines hyperparameters and architecture configuration
 */

export interface TTSModelConfig {
  modelName: string;
  version: string;
  inputDim: number;
  outputDim: number;
  numLayers: number;
  batchSize: number;
  learningRate: number;
}

export const defaultTTSConfig: TTSModelConfig = {
  modelName: "text-to-speech",
  version: "1.0.0",
  inputDim: 512,
  outputDim: 512,
  numLayers: 6,
  batchSize: 32,
  learningRate: 0.001,
};

export default defaultTTSConfig;
