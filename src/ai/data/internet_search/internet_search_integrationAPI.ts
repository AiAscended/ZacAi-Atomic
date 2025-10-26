import { registerDomain } from '../registry';
import { INTERNET_SEARCH_DOMAIN } from './internet_search_constants';
import { loadInternetSearchSeedVocabulary } from './internet_search_vocabularyManager';
import { registerDomainFiles, watchDomainFiles } from '../dataRegistry';

export const internetSearchInit = async () => {
  await loadInternetSearchSeedVocabulary();
  registerDomainFiles(INTERNET_SEARCH_DOMAIN, [
    'src/ai/data/internet_search/internet_search_seedVocabulary.json',
    'src/ai/data/internet_search/internet_search_learnedData.json',
    'src/ai/data/internet_search/internet_search_webDocReferences.json',
    'src/ai/data/internet_search/internet_search_trainingWeights.bin',
    'src/ai/data/internet_search/internet_search_pretrained_weights.json',
    'src/ai/data/internet_search/internet_search_tokens.ts',
  ]);
  try {
    watchDomainFiles(INTERNET_SEARCH_DOMAIN);
  } catch (e) {
    // ignore
  }

  registerDomain({
    name: INTERNET_SEARCH_DOMAIN,
    version: '0.1',
    initialize: async () => {
      await loadInternetSearchSeedVocabulary();
    },
    // inference/training controllers exist elsewhere in folder
  });
};

void internetSearchInit();

export default internetSearchInit;
