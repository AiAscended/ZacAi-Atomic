/**
 * File: src/ai/models/config.ts
 * Purpose: Model scanner configuration using unified registry system
 */

import path from "path";
import type { ScannerConfig } from "../shared/registry/moduleRegistry";

export const modelScannerConfig: ScannerConfig = {
  scanDir: path.join(process.cwd(), "src", "ai", "models"),
  moduleType: "model",
  registryFile: path.join(process.cwd(), "src", "ai", "models", "MODEL_REGISTRY.json"),
  
  skipFolders: ["shared", "node_modules", ".git"],
  skipFiles: ["config.ts", "modelRegistry.ts", "modelLoader.ts", "MODEL_REGISTRY.json"],
  
  requiredPatterns: {
    seeds: /seed|vocab/i,
    seedData: /seed.*data\.json/i,
    seedVocab: /seed.*vocab\.json/i,
    weights: /weight/i,
    pretrained: /pretrained/i,
    finetuned: /finetuned|fine.*tuned/i,
    tokenizer: /tokenizer\.ts/i,
    tokenizerConfig: /tokenizer.*config\.json/i,
    baseTokens: /base.*token|baseTokens\.json/i,
    inferenceEngine: /inference.*engine\.ts/i,
    trainingPipeline: /training.*pipeline\.ts/i,
  },
  
  modelTypePatterns: {
    llm: /llm|language.*model|gpt|bert|t5/i,
    cnn: /cnn|convolution|conv.*net/i,
    rnn: /rnn|recurrent|lstm|gru/i,
    transformer: /transformer|attention/i,
    gan: /gan|generative.*adversarial/i,
    diffusion: /diffusion|stable.*diffusion|dalle/i,
    multimodal: /multimodal|vision.*language|clip/i,
  },
};
