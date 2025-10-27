/**
 * File: src/ai/data/data_structures/data_structures_integrationAPI.ts
 * Purpose: Register data_structures domain into central registry
 * Depends on: All data_structures domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"
import { DATA_STRUCTURES_DOMAIN } from "./data_structures_constants"
import { loadDataStructuresSeedVocabulary } from "./data_structures_vocabularyManager"
import { dataStructuresRunInference } from "./data_structures_inferenceController"
import { dataStructuresRunTrainingEpoch } from "./data_structures_trainingController"

export const dataStructuresInit = async () => {
  await loadDataStructuresSeedVocabulary()

  registerDomainFiles(DATA_STRUCTURES_DOMAIN, [
    "src/ai/data/data_structures/data_structures_seedVocabulary.json",
    "src/ai/data/data_structures/data_structures_learnedData.json",
    "src/ai/data/data_structures/data_structures_webDocReferences.json",
    "src/ai/data/data_structures/data_structures_trainingWeights.bin",
    "src/ai/data/data_structures/data_structures_pretrained_weights.json",
    "src/ai/data/data_structures/data_structures_tokens.ts",
    "src/ai/data/data_structures/data_structures_tokenMap.ts",
    "src/ai/data/data_structures/data_structures_embeddings.ts",
    "src/ai/data/data_structures/data_structures_tokenizer.ts",
    "src/ai/data/data_structures/data_structures_parser.ts",
    "src/ai/data/data_structures/data_structures_semanticAnalyzer.ts",
    "src/ai/data/data_structures/data_structures_vocabularyManager.ts",
    "src/ai/data/data_structures/data_structures_learnedDataManager.ts",
    "src/ai/data/data_structures/data_structures_inferenceController.ts",
    "src/ai/data/data_structures/data_structures_trainingController.ts",
    "src/ai/data/data_structures/data_structures_modelWeightsLoader.ts",
    "src/ai/data/data_structures/data_structures_meta.json",
  ])

  try {
    watchDomainFiles(DATA_STRUCTURES_DOMAIN)
  } catch {}

  registerDomain({
    name: DATA_STRUCTURES_DOMAIN,
    version: "1.0.0",
    init: async () => {
      await loadDataStructuresSeedVocabulary()
    },
    query: async (input: string) => dataStructuresRunInference(input),
    train: async (opts?: Record<string, unknown>) => dataStructuresRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void dataStructuresInit()
