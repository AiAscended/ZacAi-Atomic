/**
 * File: src/ai/data/version_control/version_control_integrationAPI.ts
 * Purpose: Register version_control domain into central registry
 * Depends on: All version_control domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

const { registerDomain, registerDomainFiles, watchDomainFiles } = require("../registry")
import { VERSION_CONTROL_DOMAIN } from "./version_control_constants"
import { loadVersionControlSeedVocabulary } from "./version_control_vocabularyManager"
import { versionControlRunInference } from "./version_control_inferenceController"
import { versionControlRunTrainingEpoch } from "./version_control_trainingController"

export const versionControlInit = async () => {
  await loadVersionControlSeedVocabulary()

  registerDomainFiles(VERSION_CONTROL_DOMAIN, [
    "src/ai/data/version_control/version_control_seedVocabulary.json",
    "src/ai/data/version_control/version_control_learnedData.json",
    "src/ai/data/version_control/version_control_webDocReferences.json",
    "src/ai/data/version_control/version_control_trainingWeights.bin",
    "src/ai/data/version_control/version_control_pretrained_weights.json",
    "src/ai/data/version_control/version_control_tokens.ts",
    "src/ai/data/version_control/version_control_tokenMap.ts",
    "src/ai/data/version_control/version_control_embeddings.ts",
    "src/ai/data/version_control/version_control_tokenizer.ts",
    "src/ai/data/version_control/version_control_parser.ts",
    "src/ai/data/version_control/version_control_semanticAnalyzer.ts",
    "src/ai/data/version_control/version_control_vocabularyManager.ts",
    "src/ai/data/version_control/version_control_learnedDataManager.ts",
    "src/ai/data/version_control/version_control_inferenceController.ts",
    "src/ai/data/version_control/version_control_trainingController.ts",
    "src/ai/data/version_control/version_control_modelWeightsLoader.ts",
    "src/ai/data/version_control/version_control_meta.json",
  ])

  try {
    watchDomainFiles(VERSION_CONTROL_DOMAIN)
  } catch {}

  registerDomain({
    name: VERSION_CONTROL_DOMAIN,
    version: "1.0.0",
    init: async () => {
      await loadVersionControlSeedVocabulary()
    },
    query: async (input: string) => versionControlRunInference(input),
    train: async (opts?: Record<string, unknown>) => versionControlRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void versionControlInit()
