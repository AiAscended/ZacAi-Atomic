import { safeParseJSON } from './internet_search_utils';

export const loadInternetSearchSeedVocabulary = async (
  path = '/src/ai/data/internet_search/internet_search_seedVocabulary.json'
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const raw = fs.readFileSync(path, 'utf-8');
    return safeParseJSON(raw, { terms: [] }) as { terms: string[] };
  } catch (e) {
    return { terms: [] };
  }
};
