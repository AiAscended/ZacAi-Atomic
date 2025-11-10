/**
 * File: src/ai/orchestration/domainRouter.ts
 * 
 * Routes requests to appropriate knowledge domains based on keywords,
 * intent, and content analysis. Supports multi-domain queries.
 * 
 * Integration:
 * - Called by: mainOrchestrator.ts
 * - Uses: domainRegistry, keyword matching, intent classification
 * - Returns: List of domain names to query
 */

import { logger } from "./logger"
import { listDomains, getDomain } from "../knowledge-domains/domainRegistry"

export interface DomainRoutingCriteria {
  keywords: string[]
  intent: string
  language?: string
  contentType: "general" | "technical" | "creative" | "analytical"
}

export interface RoutedDomain {
  name: string
  confidence: number
  reason: string
  priority: number
}

/**
 * DomainRouter Class
 * 
 * Intelligent routing to knowledge domains
 */
export class DomainRouter {
  private domainKeywords: Map<string, string[]>
  private domainPriorities: Map<string, number>

  constructor() {
    this.domainKeywords = new Map()
    this.domainPriorities = new Map()
    this.initializeDomainMappings()
  }

  /**
   * Initialize domain keyword mappings
   */
  private initializeDomainMappings(): void {
    // English domain
    this.domainKeywords.set("english", [
      "grammar",
      "spelling",
      "writing",
      "language",
      "text",
      "sentence",
      "paragraph",
      "essay",
    ])
    this.domainPriorities.set("english", 90)

    // Mathematics domain
    this.domainKeywords.set("mathematics", [
      "math",
      "calculate",
      "equation",
      "algebra",
      "calculus",
      "geometry",
      "number",
      "solve",
      "formula",
    ])
    this.domainPriorities.set("mathematics", 95)

    // TypeScript domain
    this.domainKeywords.set("typescript", [
      "typescript",
      "ts",
      "type",
      "interface",
      "generic",
      "decorator",
    ])
    this.domainPriorities.set("typescript", 95)

    // Programming domain
    this.domainKeywords.set("programming", [
      "code",
      "program",
      "function",
      "class",
      "variable",
      "loop",
      "condition",
      "algorithm",
    ])
    this.domainPriorities.set("programming", 92)

    // React domain
    this.domainKeywords.set("react", [
      "react",
      "component",
      "jsx",
      "tsx",
      "hook",
      "useState",
      "useEffect",
      "props",
    ])
    this.domainPriorities.set("react", 93)

    // Next.js domain
    this.domainKeywords.set("nextjs", [
      "nextjs",
      "next.js",
      "app router",
      "server component",
      "client component",
      "route",
    ])
    this.domainPriorities.set("nextjs", 94)

    // Science domain
    this.domainKeywords.set("science", [
      "science",
      "physics",
      "chemistry",
      "biology",
      "experiment",
      "theory",
      "hypothesis",
    ])
    this.domainPriorities.set("science", 88)

    // Grammar domain
    this.domainKeywords.set("grammar", [
      "grammar",
      "syntax",
      "punctuation",
      "tense",
      "verb",
      "noun",
      "adjective",
    ])
    this.domainPriorities.set("grammar", 90)

    // Documentation domain
    this.domainKeywords.set("documentation", [
      "document",
      "documentation",
      "readme",
      "guide",
      "tutorial",
      "docs",
      "manual",
    ])
    this.domainPriorities.set("documentation", 85)

    // Testing domain
    this.domainKeywords.set("testing", [
      "test",
      "testing",
      "unit test",
      "integration",
      "jest",
      "vitest",
      "cypress",
      "spec",
    ])
    this.domainPriorities.set("testing", 90)

    // Security domain
    this.domainKeywords.set("security", [
      "security",
      "vulnerability",
      "authentication",
      "authorization",
      "encryption",
      "xss",
      "sql injection",
    ])
    this.domainPriorities.set("security", 98)

    // Error Detection domain
    this.domainKeywords.set("error_detection", [
      "error",
      "bug",
      "debug",
      "exception",
      "crash",
      "fix",
      "issue",
    ])
    this.domainPriorities.set("error_detection", 93)

    // Code Review domain
    this.domainKeywords.set("code_review", [
      "code review",
      "review",
      "refactor",
      "improve",
      "optimize",
      "best practice",
    ])
    this.domainPriorities.set("code_review", 88)

    // Data Structures domain
    this.domainKeywords.set("data_structures", [
      "data structure",
      "array",
      "list",
      "tree",
      "graph",
      "stack",
      "queue",
      "hash",
    ])
    this.domainPriorities.set("data_structures", 90)

    // Algorithms domain
    this.domainKeywords.set("algorithms", [
      "algorithm",
      "sort",
      "search",
      "complexity",
      "big o",
      "optimization",
      "recursive",
    ])
    this.domainPriorities.set("algorithms", 91)

    // Version Control domain
    this.domainKeywords.set("version_control", [
      "git",
      "github",
      "commit",
      "branch",
      "merge",
      "pull request",
      "repository",
    ])
    this.domainPriorities.set("version_control", 87)

    // Environment domain
    this.domainKeywords.set("environment", [
      "environment",
      "env",
      "config",
      "setup",
      "install",
      "deploy",
      "build",
    ])
    this.domainPriorities.set("environment", 85)

    // Internet Search domain
    this.domainKeywords.set("internet_search", [
      "search",
      "find",
      "lookup",
      "query",
      "web",
      "online",
      "internet",
    ])
    this.domainPriorities.set("internet_search", 80)

    // General domain (fallback)
    this.domainKeywords.set("general", ["general", "help", "question", "what", "how", "why"])
    this.domainPriorities.set("general", 70)
  }

  /**
   * Route request to appropriate domains
   */
  public route(criteria: DomainRoutingCriteria): RoutedDomain[] {
    const routedDomains: RoutedDomain[] = []

    logger.info("DomainRouter: Routing to domains", { criteria })

    // Get all available domains from registry
    const availableDomains = listDomains()

    // Score each domain based on keyword matches
    for (const domainName of availableDomains) {
      const score = this.calculateDomainScore(domainName, criteria.keywords)

      if (score > 0) {
        routedDomains.push({
          name: domainName,
          confidence: score,
          reason: this.getDomainMatchReason(domainName, criteria.keywords),
          priority: this.domainPriorities.get(domainName) || 50,
        })
      }
    }

    // If no specific domains matched, include general domain
    if (routedDomains.length === 0) {
      routedDomains.push({
        name: "general",
        confidence: 0.5,
        reason: "Fallback domain",
        priority: 70,
      })
    }

    // Sort by priority and confidence
    routedDomains.sort((a, b) => {
      const priorityDiff = b.priority - a.priority
      if (priorityDiff !== 0) return priorityDiff
      return b.confidence - a.confidence
    })

    // Limit to top 5 domains for performance
    const selectedDomains = routedDomains.slice(0, 5)

    logger.info("DomainRouter: Domains routed", {
      count: selectedDomains.length,
      domains: selectedDomains.map((d) => d.name),
    })

    return selectedDomains
  }

  /**
   * Calculate domain relevance score
   */
  private calculateDomainScore(domainName: string, keywords: string[]): number {
    const domainKeywords = this.domainKeywords.get(domainName) || []
    if (domainKeywords.length === 0) return 0

    let matchCount = 0
    let totalWeight = 0

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase()

      for (const domainKeyword of domainKeywords) {
        if (lowerKeyword.includes(domainKeyword) || domainKeyword.includes(lowerKeyword)) {
          matchCount++
          // Exact matches get higher weight
          const weight = lowerKeyword === domainKeyword ? 2.0 : 1.0
          totalWeight += weight
        }
      }
    }

    // Normalize score to 0-1 range
    const maxPossibleScore = keywords.length * 2
    return Math.min(totalWeight / Math.max(maxPossibleScore, 1), 1.0)
  }

  /**
   * Get explanation for why domain was matched
   */
  private getDomainMatchReason(domainName: string, keywords: string[]): string {
    const domainKeywords = this.domainKeywords.get(domainName) || []
    const matchedKeywords: string[] = []

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase()

      for (const domainKeyword of domainKeywords) {
        if (lowerKeyword.includes(domainKeyword) || domainKeyword.includes(lowerKeyword)) {
          matchedKeywords.push(keyword)
          break
        }
      }
    }

    if (matchedKeywords.length > 0) {
      return `Matched keywords: ${matchedKeywords.slice(0, 3).join(", ")}`
    }

    return "General relevance"
  }

  /**
   * Get all registered domains
   */
  public getAllDomains(): string[] {
    return Array.from(this.domainKeywords.keys())
  }

  /**
   * Get domain keywords
   */
  public getDomainKeywords(domainName: string): string[] {
    return this.domainKeywords.get(domainName) || []
  }

  /**
   * Add custom domain mapping
   */
  public addDomain(
    domainName: string,
    keywords: string[],
    priority: number = 75
  ): void {
    this.domainKeywords.set(domainName, keywords)
    this.domainPriorities.set(domainName, priority)

    logger.info("DomainRouter: Added custom domain", {
      domainName,
      keywordCount: keywords.length,
      priority,
    })
  }
}

export default DomainRouter
