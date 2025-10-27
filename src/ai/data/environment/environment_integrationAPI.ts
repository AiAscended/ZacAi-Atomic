/**
 * File: src/ai/data/environment/environment_integrationAPI.ts
 * Purpose: Register environment domain into central registry
 * Depends on: All environment domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

const { registerDomain, registerDomainFiles, watchDomainFiles } = require("../registry")
import { ENVIRONMENT_DOMAIN } from "./environment_constants"
import { loadEnvironmentSeedVocabulary } from "./environment_vocabularyManager"
import { environmentRunInference } from "./environment_inferenceController"
import { environmentRunTrainingEpoch } from "./environment_trainingController"

export const environmentInit = async () => {
  await loadEnvironmentSeedVocabulary()

  registerDomainFiles(ENVIRONMENT_DOMAIN, [
    "src/ai/data/environment/environment_seedVocabulary.json",
    "src/ai/data/environment/environment_learnedData.json",
    "src/ai/data/environment/environment_webDocReferences.json",
    "src/ai/data/environment/environment_trainingWeights.bin",
    "src/ai/data/environment/environment_pretrained_weights.json",
    "src/ai/data/environment/environment_tokens.ts",
    "src/ai/data/environment/environment_tokenMap.ts",
    "src/ai/data/environment/environment_embeddings.ts",
    "src/ai/data/environment/environment_tokenizer.ts",
    "src/ai/data/environment/environment_parser.ts",
    "src/ai/data/environment/environment_semanticAnalyzer.ts",
    "src/ai/data/environment/environment_vocabularyManager.ts",
    "src/ai/data/environment/environment_learnedDataManager.ts",
    "src/ai/data/environment/environment_inferenceController.ts",
    "src/ai/data/environment/environment_trainingController.ts",
    "src/ai/data/environment/environment_modelWeightsLoader.ts",
    "src/ai/data/environment/environment_meta.json",
  ])

  try {
    watchDomainFiles(ENVIRONMENT_DOMAIN)
  } catch {}

  registerDomain({
    name: ENVIRONMENT_DOMAIN,
    version: "1.0.0",
    init: async () => {
      await loadEnvironmentSeedVocabulary()
    },
    query: async (input: string) => environmentRunInference(input),
    train: async (opts?: Record<string, unknown>) => environmentRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void environmentInit()
