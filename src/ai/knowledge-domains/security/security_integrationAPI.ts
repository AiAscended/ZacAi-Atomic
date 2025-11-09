/**
 * File: src/ai/data/security/security_integrationAPI.ts
 * Purpose: Register security domain into central registry
 * Depends on: All security domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from "path";

import { domainRegistry } from "../domainRegistry";
import { SECURITY_DOMAIN } from "./security_constants";
import { loadSecuritySeedVocabulary } from "./security_vocabularyManager";
import { securityRunInference } from "./security_inferenceController";
import { securityRunTrainingEpoch } from "./security_trainingController";

const DOMAIN_NAME = "security";
const DOMAIN_DIR = path.join(
  process.cwd(),
  "src",
  "ai",
  "knowledge-domains",
  DOMAIN_NAME,
);

export const securityInit = async () => {
  await loadSecuritySeedVocabulary();

  domainRegistry.registerDomain({
    name: SECURITY_DOMAIN,
    displayName: "Security",
    description:
      "Security analysis, vulnerability detection, and secure coding",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

void securityInit();
