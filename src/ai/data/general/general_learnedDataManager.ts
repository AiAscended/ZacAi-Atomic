import { safeParseJSON } from './general_utils';

export const loadGeneralLearnedData = async (
  path = '/src/ai/data/general/general_learnedData.json'
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const raw = fs.readFileSync(path, 'utf-8');
    return safeParseJSON(raw, { notes: [], concepts: {} });
  } catch (e) {
    return { notes: [], concepts: {} };
  }
};

export const saveGeneralLearnedData = async (
  data: unknown,
  path = '/src/ai/data/general/general_learnedData.json'
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
