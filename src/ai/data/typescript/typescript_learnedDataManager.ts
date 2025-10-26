import { safeParseJSON } from './typescript_utils';

export const loadTypescriptLearnedData = async (
  path = '/src/ai/data/typescript/typescript_learnedData.json'
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

export const saveTypescriptLearnedData = async (
  data: unknown,
  path = '/src/ai/data/typescript/typescript_learnedData.json'
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
