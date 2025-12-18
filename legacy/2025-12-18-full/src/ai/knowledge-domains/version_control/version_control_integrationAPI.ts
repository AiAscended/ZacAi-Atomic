/**
 * File: src/ai/data/version_control/version_control_integrationAPI.ts
 * Purpose: Register version_control domain into central registry
 * Depends on: All version_control domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from "path";

import { domainRegistry } from "../domainRegistry";
import { VERSION_CONTROL_DOMAIN } from "./version_control_constants";
import { loadVersionControlSeedVocabulary } from "./version_control_vocabularyManager";
import { versionControlRunInference } from "./version_control_inferenceController";
import { versionControlRunTrainingEpoch } from "./version_control_trainingController";

const DOMAIN_NAME = "version_control";
const DOMAIN_DIR = path.join(
  process.cwd(),
  "src",
  "ai",
  "knowledge-domains",
  DOMAIN_NAME,
);

export const versionControlInit = async () => {
  await loadVersionControlSeedVocabulary();

  domainRegistry.registerDomain({
    name: VERSION_CONTROL_DOMAIN,
    displayName: "Version Control",
    description: "Git, version control workflows, and collaboration",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

void versionControlInit();
