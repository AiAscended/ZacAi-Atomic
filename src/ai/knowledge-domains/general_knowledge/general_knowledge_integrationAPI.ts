import path from "path";

import { domainRegistry } from "../domainRegistry";
import { GENERAL_DOMAIN } from "./general_knowledge_constants";
import { loadGeneralSeedVocabulary } from "./general_knowledge_vocabularyManager";
import { generalRunInference } from "./general_knowledge_inferenceController";
import { generalRunTrainingEpoch } from "./general_knowledge_trainingController";

const DOMAIN_NAME = "general_knowledge";
const DOMAIN_DIR = path.join(
  process.cwd(),
  "src",
  "ai",
  "knowledge-domains",
  DOMAIN_NAME,
);

export const generalInit = async () => {
  await loadGeneralSeedVocabulary();

  domainRegistry.registerDomain({
    name: GENERAL_DOMAIN,
    displayName: "General Knowledge",
    description: "Broad knowledge base and general information",
    atomicLevel: "organ",
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

void generalInit();
