/**
 * File: src/ai/data/english/english_learnedDataManager.ts
 * Purpose: Read/write learnedData for english domain (file-backed minimal implementation).
 */

import { safeParseJSON } from './english_utils';

export const loadEnglishLearnedData = async (
  path = '/src/ai/data/english/english_learnedData.json'
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

export const saveEnglishLearnedData = async (
  data: unknown,
  path = '/src/ai/data/english/english_learnedData.json'
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
