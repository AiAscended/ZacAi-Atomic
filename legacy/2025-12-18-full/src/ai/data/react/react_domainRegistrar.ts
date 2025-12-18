/**
 * File: src/ai/data/react/react_domainRegistrar.ts
 * Purpose: Register React domain metadata and capabilities
 * Depends on: react_constants.ts
 * Depended on by: react_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { REACT_DOMAIN } from "./react_constants"

export interface ReactDomainMetadata {
  name: string
  version: string
  description: string
  capabilities: string[]
  keywords: string[]
}

export function getReactDomainMetadata(): ReactDomainMetadata {
  return {
    name: REACT_DOMAIN,
    version: "1.0.0",
    description: "React JavaScript library knowledge domain for component-based UI development",
    capabilities: [
      "component_explanation",
      "hooks_usage",
      "state_management",
      "lifecycle_methods",
      "jsx_syntax",
      "best_practices",
      "performance_optimization",
      "pattern_recognition",
    ],
    keywords: [
      "react",
      "component",
      "jsx",
      "tsx",
      "hooks",
      "useState",
      "useEffect",
      "props",
      "state",
      "render",
      "virtual-dom",
      "lifecycle",
    ],
  }
}
