/**
 * Speech-to-text - Model Configuration
 * Defines hyperparameters and architecture configuration
 */

export interface STTModelConfig {
  modelName: string;
  version: string;
  inputDim: number;
  outputDim: number;
  numLayers: number;
  batchSize: number;
  learningRate: number;
}

export const defaultSTTConfig: STTModelConfig = {
  modelName: 'speech-to-text',
  version: '1.0.0',
  inputDim: 512,
  outputDim: 512,
  numLayers: 6,
  batchSize: 32,
  learningRate: 0.001,
};

export default defaultSTTConfig;
