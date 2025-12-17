/**
 * Observability Domain Integration API
 * 
 * Handles monitoring, logging, tracing, metrics, and alerting for system observability.
 * Provides insights into system behavior and performance.
 */

import { domainRegistry } from '../domainRegistry';
import { observabilityRunInference } from './observability_inferenceController';
import fs from 'fs/promises';
import path from 'path';

import { domainRegistry } from "../domainRegistry"

const DOMAIN_NAME = "observability"
const DOMAIN_DIR = path.join(process.cwd(), "src", "ai", "knowledge-domains", DOMAIN_NAME)
const SEEDS_DIR = path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`)

interface ObservabilitySeedConcept {
  concept?: string
  definition?: string
  [key: string]: unknown
}

type ObservabilitySeedFile = { concepts?: ObservabilitySeedConcept[] } | ObservabilitySeedConcept[]

interface ObservabilityQueryResult {
  domain: typeof DOMAIN_NAME
  confidence: number
  matches: ObservabilitySeedConcept[]
  suggestion: string
  metadata: {
    totalConcepts: number
    matchCount: number
  }
}

const OBSERVABILITY_KEYWORDS = [
  "monitor",
  "monitoring",
  "log",
  "logging",
  "trace",
  "tracing",
  "metric",
  "metrics",
  "alert",
  "alerting",
  "telemetry",
  "performance",
  "latency",
  "throughput",
  "error rate",
  "dashboard",
  "observe",
  "visibility",
  "instrumentation",
] as const

const resolveDomainPath = (...segments: string[]): string => path.join(DOMAIN_DIR, ...segments)

/**
 * Load all seed data for observability domain
 */
async function loadSeedData(): Promise<ObservabilitySeedConcept[]> {
  try {
    const files = await fs.readdir(SEEDS_DIR)
    const jsonFiles = files.filter((file) => file.endsWith(".json"))
    
    const allConcepts: unknown[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(SEEDS_DIR, file)
      const content = await fs.readFile(filePath, "utf-8")
      const data = JSON.parse(content) as ObservabilitySeedFile

      if (!Array.isArray(data) && Array.isArray(data.concepts)) {
        allConcepts.push(...data.concepts)
      } else if (Array.isArray(data)) {
        allConcepts.push(...data)
      }
    }
    
    console.log(`[Observability] Loaded ${allConcepts.length} concepts from ${jsonFiles.length} seed files`)
    return allConcepts
  } catch (error) {
    console.error("[Observability] Error loading seed data:", error)
    return []
  }
}

/**
 * Query the observability domain with a prompt
 */
export async function queryObservabilityDomain(prompt: string): Promise<ObservabilityQueryResult | null> {
  const normalizedPrompt = prompt.toLowerCase()

  const hasObservabilityKeyword = OBSERVABILITY_KEYWORDS.some((keyword) => normalizedPrompt.includes(keyword))

  if (!hasObservabilityKeyword) {
    return null
  }

  const seedData = await loadSeedData()

  const matches = seedData.filter((concept) => {
    const conceptText = JSON.stringify(concept).toLowerCase()
    return OBSERVABILITY_KEYWORDS.some((keyword) => conceptText.includes(keyword))
  })

  if (matches.length === 0) {
    return null
  }

  return {
    domain: DOMAIN_NAME,
    confidence: 0.85,
    matches: matches.slice(0, 5),
    suggestion: "Consider implementing monitoring, logging, and alerting for better system visibility",
    metadata: {
      totalConcepts: seedData.length,
      matchCount: matches.length,
    },
  }
}

/**
 * Initialize and register the observability domain
 */
export const observabilityInit = async (): Promise<void> => {
  try {
    console.log("[Observability] Initializing domain...")
    
    const seedData = await loadSeedData()
    
    if (seedData.length === 0) {
      console.warn("[Observability] No seed data loaded - domain may have limited capabilities")
    }
    
    console.log("[Observability] Domain initialized successfully")
  } catch (error) {
    console.error("[Observability] Initialization error:", error)
  }

  // Register domain files for tracking;

  // Register the domain with the registry
  domainRegistry.registerDomain({
    name: DOMAIN_NAME,
    displayName: "Observability",
    description: "Observability domain capabilities",
    atomicLevel: "molecule",
    modules: [],
    seedDataPath: resolveDomainPath(`${DOMAIN_NAME}_seeds`),
    learnedDataPath: resolveDomainPath(`${DOMAIN_NAME}_learned`),
    weightsPath: resolveDomainPath(`${DOMAIN_NAME}_weights`),
    enabled: true,
  })
}

// Auto-initialize when imported
void observabilityInit()
