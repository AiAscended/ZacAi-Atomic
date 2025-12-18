import path from "path";

import { domainRegistry } from "../domainRegistry";
import { MATHEMATICS_DOMAIN } from "./mathematics_constants";
import { loadMathematicsSeedVocabulary } from "./mathematics_vocabularyManager";
import { mathematicsRunInference } from "./mathematics_inferenceController";
import { mathematicsRunTrainingEpoch } from "./mathematics_trainingController";

const DOMAIN_NAME = "mathematics";
const DOMAIN_DIR = path.join(
  process.cwd(),
  "src",
  "ai",
  "knowledge-domains",
  DOMAIN_NAME,
);

export const mathematicsInit = async () => {
  await loadMathematicsSeedVocabulary();

  domainRegistry.registerDomain({
    name: MATHEMATICS_DOMAIN,
    displayName: "Mathematics",
    description: "Mathematical operations, equations, and problem solving",
    atomicLevel: "cell",
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true,
  });
};

void mathematicsInit();
