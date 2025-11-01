import { PROGRAMMING_DOMAIN } from "./programming_constants"

export interface ProgrammingDomainMetadata {
  name: string
  version: string
  description: string
  capabilities: string[]
  keywords: string[]
}

export function getProgrammingDomainMetadata(): ProgrammingDomainMetadata {
  return {
    name: PROGRAMMING_DOMAIN,
    version: "1.0.0",
    description: "General programming concepts and best practices across languages",
    capabilities: [
      "concept_explanation",
      "syntax_help",
      "debugging_assistance",
      "best_practices",
      "design_patterns",
      "algorithm_guidance",
    ],
    keywords: [
      "programming",
      "code",
      "function",
      "variable",
      "class",
      "algorithm",
      "data-structure",
      "debugging",
      "syntax",
    ],
  }
}
