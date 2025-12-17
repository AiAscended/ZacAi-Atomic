import path from 'path'

import { TYPESCRIPT_DOMAIN } from "./typescript_constants"
import { loadTypescriptSeedVocabulary } from "./typescript_vocabularyManager"

const DOMAIN_NAME = 'typescript';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const typescriptInit = async () => {
  await loadTypescriptSeedVocabulary()

}

void typescriptInit()

export default typescriptInit
