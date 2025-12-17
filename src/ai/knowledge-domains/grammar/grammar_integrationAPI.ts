/**
 * File: src/ai/data/grammar/grammar_integrationAPI.ts
 * Purpose: Register grammar domain into central registry
 * Depends on: All grammar domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from "path"

import { domainRegistry } from "../domainRegistry"
import { GRAMMAR_DOMAIN } from "./grammar_constants"
import { loadGrammarSeedVocabulary } from "./grammar_vocabularyManager"

const DOMAIN_NAME = "grammar"
const DOMAIN_ROOT = path.join(process.cwd(), "src", "ai", "knowledge-domains", DOMAIN_NAME)

const resolveDomainPath = (suffix: string) => path.join(DOMAIN_ROOT, `${DOMAIN_NAME}_${suffix}`)

export const grammarInit = async () => {
  await loadGrammarSeedVocabulary()

  domainRegistry.registerDomain({
    name: GRAMMAR_DOMAIN,
    displayName: "Grammar",
    description: "Grammar rules, syntax analysis, and language structure",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: resolveDomainPath("seeds"),
    learnedDataPath: resolveDomainPath("learned"),
    weightsPath: resolveDomainPath("weights"),
    enabled: true,
  })
}

void grammarInit()
