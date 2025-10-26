/**
 * File: src/ai/data/english/english_vocabularyManager.ts
 * Purpose: Load seed vocabulary for english domain (node-friendly for Codespaces).
 */

import { safeParseJSON } from './english_utils';

export const loadEnglishSeedVocabulary = async (
  path = '/src/ai/data/english/english_seedVocabulary.json'
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const raw = fs.readFileSync(path, 'utf-8');
    return safeParseJSON(raw, { words: [] }) as { words: string[] };
  } catch (e) {
    return { words: [] };
  }
};
