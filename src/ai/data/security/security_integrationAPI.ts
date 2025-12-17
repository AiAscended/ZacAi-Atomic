/**
 * File: src/ai/data/security/security_integrationAPI.ts
 * Purpose: Register security domain into central registry
 * Depends on: All security domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { SECURITY_DOMAIN } from "./security_constants"
import { loadSecuritySeedVocabulary } from "./security_vocabularyManager"
import { securityRunInference } from "./security_inferenceController"
import { securityRunTrainingEpoch } from "./security_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const securityInit = async () => {
  await loadSecuritySeedVocabulary()

  registerDomainFiles(SECURITY_DOMAIN, [
    "src/ai/data/security/security_seedVocabulary.json",
    "src/ai/data/security/security_learnedData.json",
    "src/ai/data/security/security_webDocReferences.json",
    "src/ai/data/security/security_trainingWeights.bin",
    "src/ai/data/security/security_pretrained_weights.json",
    "src/ai/data/security/security_tokens.ts",
    "src/ai/data/security/security_tokenMap.ts",
    "src/ai/data/security/security_embeddings.ts",
    "src/ai/data/security/security_tokenizer.ts",
    "src/ai/data/security/security_parser.ts",
    "src/ai/data/security/security_semanticAnalyzer.ts",
    "src/ai/data/security/security_vocabularyManager.ts",
    "src/ai/data/security/security_learnedDataManager.ts",
    "src/ai/data/security/security_inferenceController.ts",
    "src/ai/data/security/security_trainingController.ts",
    "src/ai/data/security/security_modelWeightsLoader.ts",
    "src/ai/data/security/security_meta.json",
  ])

  try {
    watchDomainFiles(SECURITY_DOMAIN)
  } catch (e) {}

  registerDomain({
    name: SECURITY_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadSecuritySeedVocabulary()
    },
    query: async (input: string) => securityRunInference(input),
    train: async (opts?: Record<string, unknown>) => securityRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void securityInit()
