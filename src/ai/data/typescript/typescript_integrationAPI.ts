import { registerDomain } from '../registry';
import { TYPESCRIPT_DOMAIN } from './typescript_constants';
import { loadTypescriptSeedVocabulary } from './typescript_vocabularyManager';
import { registerDomainFiles, watchDomainFiles } from '../dataRegistry';

export const typescriptInit = async () => {
  await loadTypescriptSeedVocabulary();
  registerDomainFiles(TYPESCRIPT_DOMAIN, [
    'src/ai/data/typescript/typescript_seedVocabulary.json',
    'src/ai/data/typescript/typescript_learnedData.json',
    'src/ai/data/typescript/typescript_webDocReferences.json',
    'src/ai/data/typescript/typescript_trainingWeights.bin',
    'src/ai/data/typescript/typescript_pretrained_weights.json',
    'src/ai/data/typescript/typescript_tokens.ts',
  ]);
  try {
    watchDomainFiles(TYPESCRIPT_DOMAIN);
  } catch (e) {
    // ignore
  }

  registerDomain({
    name: TYPESCRIPT_DOMAIN,
    version: '0.1',
    initialize: async () => {
      await loadTypescriptSeedVocabulary();
    },
  });
};

void typescriptInit();

export default typescriptInit;
