import path from "path"

import { domainRegistry } from "../domainRegistry"
import { MATHEMATICS_DOMAIN } from "./mathematics_constants"
import { loadMathematicsSeedVocabulary } from "./mathematics_vocabularyManager"

const DOMAIN_NAME = "mathematics"
const DOMAIN_ROOT = path.join(process.cwd(), "src", "ai", "knowledge-domains", DOMAIN_NAME)

const resolveDomainPath = (suffix: string) => path.join(DOMAIN_ROOT, `${DOMAIN_NAME}_${suffix}`)

export const mathematicsInit = async () => {
  await loadMathematicsSeedVocabulary()

  domainRegistry.registerDomain({
    name: MATHEMATICS_DOMAIN,
    displayName: "Mathematics",
    description: "Mathematical operations, equations, and problem solving",
    atomicLevel: "cell",
    modules: [],
    seedDataPath: resolveDomainPath("seeds"),
    learnedDataPath: resolveDomainPath("learned"),
    weightsPath: resolveDomainPath("weights"),
    enabled: true,
  })
}

void mathematicsInit()
