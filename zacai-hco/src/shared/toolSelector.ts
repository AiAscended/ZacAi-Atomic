import { ScientificCalculator } from "@zacai-root/ai/shared/tools/shared-ScientificCalculator"
import { urlLookup } from "@zacai-root/ai/shared/tools/url-lookup-tool"
import { domainRegistry } from "@zacai-root/ai/knowledge-domains/domainRegistry"

export interface Toolset {
  calculator: typeof ScientificCalculator
  urlLookup: typeof urlLookup
  domainRegistry: typeof domainRegistry
}

export function buildToolset(): Toolset {
  return {
    calculator: ScientificCalculator,
    urlLookup,
    domainRegistry,
  }
}
