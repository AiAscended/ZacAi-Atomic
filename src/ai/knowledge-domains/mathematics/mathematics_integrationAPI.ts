import path from 'path'

import { MATHEMATICS_DOMAIN } from "./mathematics_constants"
import { loadMathematicsSeedVocabulary } from "./mathematics_vocabularyManager"
import { mathematicsRunInference } from "./mathematics_inferenceController"
import { mathematicsRunTrainingEpoch } from "./mathematics_trainingController"

const DOMAIN_NAME = 'mathematics';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const mathematicsInit = async () => {
  await loadMathematicsSeedVocabulary()

}

void mathematicsInit()
