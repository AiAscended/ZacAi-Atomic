/**
 * File: src/ai/orchestration/dataIntegrator.ts
 * Purpose: Helper to discover domains under `src/ai/data/*`, register them with
 * the domain registry, register their files with the dataRegistry and optionally
 * start watching for changes.
 *
 * : Converted from fs-based discovery to static domain registration for Next.js compatibility
 */

import { registerDomain } from "../data/registry"
import dataRegistry from "../data/dataRegistry"
import { publish } from "./eventBus"

const KNOWN_DOMAINS = [
  "mathematics",
  "typescript",
  "english",
  "general",
  "internet_search",
  "grammar",
  "science",
  "history",
  "geography",
  "art",
  "music",
  "sports",
  "technology",
  "business",
  "health",
  "cooking",
]

export const discoverAndRegisterDomains = async (watchFiles = false) => {
  const registered: string[] = []

  for (const domainName of KNOWN_DOMAINS) {
    try {
      const meta = {
        name: domainName,
        description: `${domainName.charAt(0).toUpperCase() + domainName.slice(1)} domain`,
        version: "1.0.0",
        keywords: [domainName],
      }

      // Register domain with the registry
      registerDomain(domainName, {
        name: domainName,
        description: meta.description,
        keywords: meta.keywords as string[],
        process: async (input: string) => {
          return {
            result: `Processed by ${domainName} domain: ${input}`,
            confidence: 0.8,
          }
        },
      })

      const domainFiles = [
        `${domainName}_tokenizer.ts`,
        `${domainName}_parser.ts`,
        `${domainName}_semanticAnalyzer.ts`,
        `${domainName}_modelWeightsLoader.ts`,
        `${domainName}_inferenceController.ts`,
        `${domainName}_vocabularyManager.ts`,
        `${domainName}_learnedDataManager.ts`,
      ]

      for (const file of domainFiles) {
        const filePath = `src/ai/data/${domainName}/${file}`
        dataRegistry.registerFile(filePath, `// ${domainName} ${file} module`)
      }

      registered.push(domainName)
      publish("domain:registered", { domain: domainName, meta })
    } catch (e) {
      publish("error", { source: "dataIntegrator", domain: domainName, error: e })
    }
  }

  return registered
}

export const watchDomainFiles = (domainName: string) => {
  console.log(`[v0] File watching not available in preview environment for domain: ${domainName}`)
  return () => {} // Return no-op cleanup function
}
