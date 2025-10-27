import { registerDomain } from "../registry"
import { TYPESCRIPT_DOMAIN } from "./typescript_constants"
import { loadTypescriptSeedVocabulary } from "./typescript_vocabularyManager"
import { typescriptRunInference } from "./typescript_inferenceController"
import { typescriptRunTrainingEpoch } from "./typescript_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const typescriptInit = async () => {
  await loadTypescriptSeedVocabulary()
  registerDomainFiles(TYPESCRIPT_DOMAIN, [
    "src/ai/data/typescript/typescript_seedVocabulary.json",
    "src/ai/data/typescript/typescript_learnedData.json",
    "src/ai/data/typescript/typescript_webDocReferences.json",
    "src/ai/data/typescript/typescript_trainingWeights.bin",
    "src/ai/data/typescript/typescript_pretrained_weights.json",
    "src/ai/data/typescript/typescript_tokens.ts",
    "src/ai/data/typescript/typescript_tokenMap.ts",
    "src/ai/data/typescript/typescript_embeddings.ts",
    "src/ai/data/typescript/typescript_tokenizer.ts",
    "src/ai/data/typescript/typescript_parser.ts",
    "src/ai/data/typescript/typescript_semanticAnalyzer.ts",
    "src/ai/data/typescript/typescript_vocabularyManager.ts",
    "src/ai/data/typescript/typescript_learnedDataManager.ts",
    "src/ai/data/typescript/typescript_inferenceController.ts",
    "src/ai/data/typescript/typescript_trainingController.ts",
    "src/ai/data/typescript/typescript_modelWeightsLoader.ts",
    "src/ai/data/typescript/typescript_domainRegistrar.ts",
    "src/ai/data/typescript/typescript_meta.json",
  ])
  try {
    watchDomainFiles(TYPESCRIPT_DOMAIN)
  } catch (e) {
    // ignore
  }

  registerDomain({
    name: TYPESCRIPT_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadTypescriptSeedVocabulary()
    },
    query: async (input: string) => typescriptRunInference(input),
    train: async (opts?: Record<string, unknown>) => {
      const samples = (opts?.samples as any[]) || []
      return typescriptRunTrainingEpoch(samples)
    },
  })
}

void typescriptInit()

export default typescriptInit
