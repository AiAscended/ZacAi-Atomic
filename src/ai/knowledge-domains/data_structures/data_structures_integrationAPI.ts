/**
 * File: src/ai/data/data_structures/data_structures_integrationAPI.ts
 * Purpose: Register data_structures domain into central registry
 * Depends on: All data_structures domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from "path";

import { domainRegistry } from "../domainRegistry";
import { DATA_STRUCTURES_DOMAIN } from "./data_structures_constants";
import { loadDataStructuresSeedVocabulary } from "./data_structures_vocabularyManager";
import { dataStructuresRunInference } from "./data_structures_inferenceController";
import { dataStructuresRunTrainingEpoch } from "./data_structures_trainingController";

const DOMAIN_NAME = "data_structures";
const DOMAIN_DIR = path.join(
  process.cwd(),
  "src",
  "ai",
  "knowledge-domains",
  DOMAIN_NAME,
);

export const dataStructuresInit = async () => {
  await loadDataStructuresSeedVocabulary();

  domainRegistry.registerDomain({
    name: DATA_STRUCTURES_DOMAIN,
    displayName: "Data Structures",
    description: "Data structure design, implementation, and usage patterns",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

void dataStructuresInit();
