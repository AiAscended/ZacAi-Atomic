import path from 'path'

import { domainRegistry } from '../domainRegistry'
import { TYPESCRIPT_DOMAIN } from "./typescript_constants"
import { loadTypescriptSeedVocabulary } from "./typescript_vocabularyManager"

const DOMAIN_NAME = 'typescript';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const typescriptInit = async () => {
  await loadTypescriptSeedVocabulary()

  domainRegistry.registerDomain({
  name: TYPESCRIPT_DOMAIN,
  displayName: 'TypeScript',
  description: 'TypeScript language features, type system, and compilation',
  atomicLevel: 'molecule',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});
}

void typescriptInit()

export default typescriptInit
