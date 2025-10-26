import { registerDomain } from '../registry';
import { GENERAL_DOMAIN } from './general_constants';
import { loadGeneralSeedVocabulary } from './general_vocabularyManager';
import { generalRunInference } from './general_inferenceController';
import { generalRunTrainingEpoch } from './general_trainingController';
import { registerDomainFiles, watchDomainFiles } from '../dataRegistry';

export const generalInit = async () => {
  await loadGeneralSeedVocabulary();
  registerDomainFiles(GENERAL_DOMAIN, [
    'src/ai/data/general/general_seedVocabulary.json',
    'src/ai/data/general/general_learnedData.json',
    'src/ai/data/general/general_webDocReferences.json',
    'src/ai/data/general/general_trainingWeights.bin',
    'src/ai/data/general/general_pretrained_weights.json',
    'src/ai/data/general/general_tokens.ts',
    'src/ai/data/general/general_tokenizer.ts',
  ]);
  try {
    watchDomainFiles(GENERAL_DOMAIN);
  } catch (e) {
    // ignore
  }

  registerDomain({
    name: GENERAL_DOMAIN,
    version: '0.1',
    initialize: async () => {
      await loadGeneralSeedVocabulary();
    },
    query: async (input: string) => generalRunInference(input),
    train: async (opts?: Record<string, unknown>) =>
      generalRunTrainingEpoch(opts as { epochs?: number }),
  });
};

void generalInit();
