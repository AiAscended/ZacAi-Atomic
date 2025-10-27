/**
 * File: src/ai/shared/tools/urlLookup.ts
 * Purpose: Shared URL lookup tool for fetching content from reference URLs
 * Used by all domains to access their specific knowledge sources
 *
 * Dependencies: None (atomic module)
 * Depended on by: All domain inference controllers
 */

export interface URLSource {
  name: string
  url: string
  description: string
  domain: string
}

/**
 * Fetch content from a URL (browser-compatible)
 * In production, this would make actual HTTP requests
 */
export async function fetchURL(url: string): Promise<string> {
  try {
    // In browser environment, we can't make arbitrary HTTP requests due to CORS
    // This would need to be proxied through an API route in production
    console.log(`[v0] URL lookup: Would fetch ${url}`)
    return `Content from ${url} (simulated in preview environment)`
  } catch (error) {
    console.error(`[v0] Failed to fetch ${url}:`, error)
    return ""
  }
}

/**
 * Find URL sources for a specific domain
 */
export function findSources(domain: string): URLSource[] {
  // This would load from domain-specific JSON/YAML files in production
  const allSources: URLSource[] = [
    {
      name: "Wikipedia",
      url: "https://en.wikipedia.org",
      description: "General knowledge encyclopedia",
      domain: "general",
    },
    {
      name: "MDN Web Docs",
      url: "https://developer.mozilla.org",
      description: "Web development documentation",
      domain: "typescript",
    },
    {
      name: "Math is Fun",
      url: "https://www.mathsisfun.com",
      description: "Mathematics tutorials and explanations",
      domain: "mathematics",
    },
    {
      name: "Merriam-Webster Dictionary",
      url: "https://www.merriam-webster.com",
      description: "English dictionary and thesaurus",
      domain: "english",
    },
  ]

  return allSources.filter((s) => s.domain === domain)
}

/**
 * Search within URL sources for specific content
 */
export async function searchSources(domain: string, query: string): Promise<string[]> {
  const sources = findSources(domain)
  const results: string[] = []

  for (const source of sources) {
    const content = await fetchURL(`${source.url}/search?q=${encodeURIComponent(query)}`)
    if (content) {
      results.push(`From ${source.name}: ${content}`)
    }
  }

  return results
}
