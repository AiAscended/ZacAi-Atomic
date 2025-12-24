import path from 'path'

import { GENERAL_DOMAIN } from "./general_knowledge_constants"
import { loadGeneralSeedVocabulary } from "./general_knowledge_vocabularyManager"
import { generalRunInference } from "./general_knowledge_inferenceController"
import { generalRunTrainingEpoch } from "./general_knowledge_trainingController"

const DOMAIN_NAME = 'general_knowledge';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const generalInit = async () => {
  await loadGeneralSeedVocabulary()

}

void generalInit()
