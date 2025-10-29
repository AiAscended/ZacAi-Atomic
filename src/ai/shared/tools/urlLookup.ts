/**
 * File: src/ai/shared/tools/urlLookup.ts
 * Purpose: Shared URL lookup tool for fetching content from reference URLs
 * Used by all domains to access their specific knowledge sources
 *
 * Dependencies: urlSources.json
 * Depended on by: All domain inference controllers
 */

import urlSourcesData from "./urlSources.json"

export interface URLSource {
  name: string
  url: string
  description: string
  searchPath?: string
  apiPath?: string
  format?: string
}

/**
 * Fetch content from a URL (browser-compatible)
 * In production, this would make actual HTTP requests
 */
export async function fetchURL(url: string): Promise<string> {
  try {
    // Note: This will be blocked by CORS for most external sites
    // In production, this should be proxied through an API route
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "ZacAi-Atomic/1.0",
      },
    })

    if (response.ok) {
      const content = await response.text()
      console.log(`[v0] Successfully fetched ${url}`)
      return content
    } else {
      console.log(`[v0] Failed to fetch ${url}: ${response.status}`)
      return `Content from ${url} (fetch failed: ${response.status})`
    }
  } catch (error) {
    console.error(`[v0] Failed to fetch ${url}:`, error)
    return `Content from ${url} (CORS blocked - needs API proxy in production)`
  }
}

/**
 * Find URL sources for a specific domain
 */
export function findSources(domain: string): URLSource[] {
  const sources = urlSourcesData[domain as keyof typeof urlSourcesData] || []
  return sources as URLSource[]
}

/**
 * Search within URL sources for specific content
 */
export async function searchSources(domain: string, query: string): Promise<string[]> {
  const sources = findSources(domain)
  const results: string[] = []

  for (const source of sources) {
    const searchUrl = source.searchPath
      ? `${source.url}${source.searchPath}${encodeURIComponent(query)}`
      : `${source.url}/search?q=${encodeURIComponent(query)}`

    console.log(`[v0] Searching ${source.name} at: ${searchUrl}`)

    const content = await fetchURL(searchUrl)
    if (content && !content.includes("CORS blocked")) {
      results.push(`From ${source.name}: ${content.substring(0, 500)}...`)
    } else {
      results.push(`From ${source.name}: (Search available at ${searchUrl})`)
    }
  }

  return results
}

/**
 * Get search engine URLs for internet search domain
 */
export function getSearchEngines(): URLSource[] {
  return findSources("internet_search")
}
