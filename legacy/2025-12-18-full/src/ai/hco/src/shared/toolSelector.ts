import { ScientificCalculator } from "@/ai/shared/tools/shared-ScientificCalculator"
import { getURLLookupTool, URLLookupTool } from "@/ai/shared/tools/url-lookup-tool"
import { getEnabledDomains } from "@/ai/knowledge-domains"

export interface Toolset {
  calculator: typeof ScientificCalculator
  urlLookup: URLLookupTool
  getDomains: typeof getEnabledDomains
}

export function buildToolset(): Toolset {
  return {
    calculator: ScientificCalculator,
    urlLookup: getURLLookupTool(),
    getDomains: getEnabledDomains,
  }
}
