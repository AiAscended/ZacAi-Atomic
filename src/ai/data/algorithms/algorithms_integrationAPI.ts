/**
 * File: src/ai/data/algorithms/algorithms_integrationAPI.ts
 * Purpose: Register algorithms domain into central registry
 * Depends on: All algorithms domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

const { registerDomain, registerDomainFiles, watchDomainFiles } = require("../registry")
import { ALGORITHMS_DOMAIN } from "./algorithms_constants"
import { loadAlgorithmsSeedVocabulary } from "./algorithms_vocabularyManager"
import { algorithmsRunInference } from "./algorithms_inferenceController"
import { algorithmsRunTrainingEpoch } from "./algorithms_trainingController"

export const algorithmsInit = async () => {
  await loadAlgorithmsSeedVocabulary()

  registerDomainFiles(ALGORITHMS_DOMAIN, [
    "src/ai/data/algorithms/algorithms_seedVocabulary.json",
    "src/ai/data/algorithms/algorithms_learnedData.json",
    "src/ai/data/algorithms/algorithms_webDocReferences.json",
    "src/ai/data/algorithms/algorithms_trainingWeights.bin",
    "src/ai/data/algorithms/algorithms_pretrained_weights.json",
    "src/ai/data/algorithms/algorithms_tokens.ts",
    "src/ai/data/algorithms/algorithms_tokenMap.ts",
    "src/ai/data/algorithms/algorithms_embeddings.ts",
    "src/ai/data/algorithms/algorithms_tokenizer.ts",
    "src/ai/data/algorithms/algorithms_parser.ts",
    "src/ai/data/algorithms/algorithms_semanticAnalyzer.ts",
    "src/ai/data/algorithms/algorithms_vocabularyManager.ts",
    "src/ai/data/algorithms/algorithms_learnedDataManager.ts",
    "src/ai/data/algorithms/algorithms_inferenceController.ts",
    "src/ai/data/algorithms/algorithms_trainingController.ts",
    "src/ai/data/algorithms/algorithms_modelWeightsLoader.ts",
    "src/ai/data/algorithms/algorithms_meta.json",
  ])

  try {
    watchDomainFiles(ALGORITHMS_DOMAIN)
  } catch {}

  registerDomain({
    name: ALGORITHMS_DOMAIN,
    version: "1.0.0",
    init: async () => {
      await loadAlgorithmsSeedVocabulary()
    },
    query: async (input: string) => algorithmsRunInference(input),
    train: async (opts?: Record<string, unknown>) => algorithmsRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void algorithmsInit()
