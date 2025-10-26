import { safeParseJSON } from './internet_search_utils';

export const loadInternetSearchLearnedData = async (
  path = '/src/ai/data/internet_search/internet_search_learnedData.json'
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const raw = fs.readFileSync(path, 'utf-8');
    return safeParseJSON(raw, { notes: [], indexes: {} });
  } catch (e) {
    return { notes: [], indexes: {} };
  }
};

export const saveInternetSearchLearnedData = async (
  data: unknown,
  path = '/src/ai/data/internet_search/internet_search_learnedData.json'
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
};
