/**
 * File: src/ai/data/react/react_integrationAPI.ts
 * Purpose: Integration API to register React domain with the central registry
 * Depends on: All react domain modules
 * Depended on by: src/main.ts, src/ai/data/registerAllDomains.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from "path";

import { domainRegistry } from "../domainRegistry";
import { REACT_DOMAIN } from "./react_constants";
import { loadReactSeedVocabulary } from "./react_vocabularyManager";
import { reactRunInference } from "./react_inferenceController";
import { reactRunTrainingEpoch } from "./react_trainingController";

const DOMAIN_NAME = "react";
const DOMAIN_DIR = path.join(
  process.cwd(),
  "src",
  "ai",
  "knowledge-domains",
  DOMAIN_NAME,
);

export const reactInit = async () => {
  await loadReactSeedVocabulary();

  domainRegistry.registerDomain({
    name: REACT_DOMAIN,
    displayName: "React",
    description: "React framework, hooks, components, and state management",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

// Auto-initialize when imported
void reactInit();

export default reactInit;
