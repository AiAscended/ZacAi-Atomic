import { safeParseJSON } from './general_utils';

export const loadGeneralSeedVocabulary = async (
  path = '/src/ai/data/general/general_seedVocabulary.json'
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
