/**
 * File: src/ai/data/documentation/documentation_integrationAPI.ts
 * Purpose: Register documentation domain into central registry
 * Depends on: All documentation domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { DOCUMENTATION_DOMAIN } from "./documentation_constants"
import { loadDocumentationSeedVocabulary } from "./documentation_vocabularyManager"
import { documentationRunInference } from "./documentation_inferenceController"
import { documentationRunTrainingEpoch } from "./documentation_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const documentationInit = async () => {
  await loadDocumentationSeedVocabulary()

  registerDomainFiles(DOCUMENTATION_DOMAIN, [
    "src/ai/data/documentation/documentation_seedVocabulary.json",
    "src/ai/data/documentation/documentation_learnedData.json",
    "src/ai/data/documentation/documentation_webDocReferences.json",
    "src/ai/data/documentation/documentation_trainingWeights.bin",
    "src/ai/data/documentation/documentation_pretrained_weights.json",
    "src/ai/data/documentation/documentation_tokens.ts",
    "src/ai/data/documentation/documentation_tokenMap.ts",
    "src/ai/data/documentation/documentation_embeddings.ts",
    "src/ai/data/documentation/documentation_tokenizer.ts",
    "src/ai/data/documentation/documentation_parser.ts",
    "src/ai/data/documentation/documentation_semanticAnalyzer.ts",
    "src/ai/data/documentation/documentation_vocabularyManager.ts",
    "src/ai/data/documentation/documentation_learnedDataManager.ts",
    "src/ai/data/documentation/documentation_inferenceController.ts",
    "src/ai/data/documentation/documentation_trainingController.ts",
    "src/ai/data/documentation/documentation_modelWeightsLoader.ts",
    "src/ai/data/documentation/documentation_meta.json",
  ])

  try {
    watchDomainFiles(DOCUMENTATION_DOMAIN)
  } catch (e) {}

  registerDomain({
    name: DOCUMENTATION_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadDocumentationSeedVocabulary()
    },
    query: async (input: string) => documentationRunInference(input),
    train: async (opts?: Record<string, unknown>) => documentationRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void documentationInit()
