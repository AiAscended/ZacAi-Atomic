/**
 * File: src/ai/data/error_detection/error_detection_integrationAPI.ts
 * Purpose: Register error detection domain into central registry
 * Depends on: All error_detection domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from "path"

import { domainRegistry } from "../domainRegistry"
import { ERROR_DETECTION_DOMAIN } from "./error_detection_constants"
import { loadErrorDetectionSeedVocabulary } from "./error_detection_vocabularyManager"

const DOMAIN_NAME = "error_detection"
const DOMAIN_DIR = path.join(process.cwd(), "src", "ai", "knowledge-domains", DOMAIN_NAME)
const DOMAIN_SEED_PATH = path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`)
const DOMAIN_LEARNED_PATH = path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`)
const DOMAIN_WEIGHTS_PATH = path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`)

export const errorDetectionInit = async (): Promise<void> => {
  await loadErrorDetectionSeedVocabulary()

  domainRegistry.registerDomain({
    name: ERROR_DETECTION_DOMAIN,
    displayName: "Error Detection",
    description: "Error identification, validation, and diagnostic analysis",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: DOMAIN_SEED_PATH,
    learnedDataPath: DOMAIN_LEARNED_PATH,
    weightsPath: DOMAIN_WEIGHTS_PATH,
    enabled: true,
  })
}

void errorDetectionInit()
