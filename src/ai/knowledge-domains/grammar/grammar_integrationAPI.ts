/**
 * File: src/ai/data/grammar/grammar_integrationAPI.ts
 * Purpose: Register grammar domain into central registry
 * Depends on: All grammar domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { domainRegistry } from '../domainRegistry'
import { GRAMMAR_DOMAIN } from "./grammar_constants"
import { loadGrammarSeedVocabulary } from "./grammar_vocabularyManager"
import { grammarRunInference } from "./grammar_inferenceController"
import { grammarRunTrainingEpoch } from "./grammar_trainingController"

const DOMAIN_NAME = 'grammar';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const grammarInit = async () => {
  await loadGrammarSeedVocabulary()

  domainRegistry.registerDomain({
  name: GRAMMAR_DOMAIN,
  displayName: 'Grammar',
  description: 'Grammar rules, syntax analysis, and language structure',
  atomicLevel: 'molecule',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});
}

void grammarInit()
