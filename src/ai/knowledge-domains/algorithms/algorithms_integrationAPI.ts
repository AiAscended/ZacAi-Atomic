/**
 * File: src/ai/data/algorithms/algorithms_integrationAPI.ts
 * Purpose: Register algorithms domain into central registry
 * Depends on: All algorithms domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from "path";

import { domainRegistry } from "../domainRegistry";
import { ALGORITHMS_DOMAIN } from "./algorithms_constants";
import { loadAlgorithmsSeedVocabulary } from "./algorithms_vocabularyManager";
import { algorithmsRunInference } from "./algorithms_inferenceController";
import { algorithmsRunTrainingEpoch } from "./algorithms_trainingController";

const DOMAIN_NAME = "algorithms";
const DOMAIN_DIR = path.join(
  process.cwd(),
  "src",
  "ai",
  "knowledge-domains",
  DOMAIN_NAME,
);

export const algorithmsInit = async () => {
  await loadAlgorithmsSeedVocabulary();

  domainRegistry.registerDomain({
    name: ALGORITHMS_DOMAIN,
    displayName: "Algorithms",
    description: "Algorithm design, complexity analysis, and optimization",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

void algorithmsInit();
