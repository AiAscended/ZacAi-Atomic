/**
 * Neuro-symbolic-reasoning - Model Configuration
 * Defines hyperparameters and architecture configuration
 */

export interface NEUROModelConfig {
  modelName: string;
  version: string;
  inputDim: number;
  outputDim: number;
  numLayers: number;
  batchSize: number;
  learningRate: number;
}

export const defaultNEUROConfig: NEUROModelConfig = {
  modelName: "neuro-symbolic-reasoning",
  version: "1.0.0",
  inputDim: 512,
  outputDim: 512,
  numLayers: 6,
  batchSize: 32,
  learningRate: 0.001,
};

export default defaultNEUROConfig;
