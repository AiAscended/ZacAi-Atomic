/**
 * File: src/ai/data/english/english_integrationAPI.ts
 * Purpose: Register the english domain into the new `src/ai/data/registry`.
 */

import { ENGLISH_DOMAIN } from './english_constants';
import { loadEnglishSeedVocabulary } from './english_vocabularyManager';
import path from 'path';

export const englishInit = async () => {
  await loadEnglishSeedVocabulary();
  // Register domain files with the central data registry so orchestrator can track them;
  // Optionally start fs watchers for domain files (best-effort)
};

// Register the domain with unified registry
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', ENGLISH_DOMAIN);


// Auto-register on import
void englishInit();
