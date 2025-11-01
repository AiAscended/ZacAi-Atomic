/**
 * File: src/ai/search-engine/webCrawler.ts
 * Purpose: Crawl web pages and extract content
 * Depends on: None (atomic module)
 * Depended on by: src/ai/search-engine/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

export interface CrawlResult {
  url: string
  title: string
  content: string
  links: string[]
  timestamp: number
}

/**
 * Crawl a URL and extract structured content
 * @param url - URL to crawl
 * @returns Crawled content and metadata
 */
export async function crawlUrl(url: string): Promise<CrawlResult> {
  try {
    const response = await fetch(url)
    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : "Untitled"

    // Extract text content (remove HTML tags)
    const content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 5000) // Limit content length

    // Extract links
    const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)
    const links = Array.from(linkMatches)
      .map((match) => match[1])
      .filter((link) => link.startsWith("http"))
      .slice(0, 50) // Limit links

    return {
      url,
      title,
      content,
      links,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`[webCrawler] Failed to crawl ${url}:`, error)
    return {
      url,
      title: "Error",
      content: "",
      links: [],
      timestamp: Date.now(),
    }
  }
}
