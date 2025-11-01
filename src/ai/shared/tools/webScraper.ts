/**
 * File: src/ai/shared/tools/webScraper.ts
 * Purpose: Web scraping tool for extracting content from URLs without API keys
 * Depends on: None (uses native fetch)
 * Depended on by: All domain inference controllers
 * Creator: Vercel v0 Coding Assistant
 */

export interface ScrapedContent {
  title: string
  snippet: string
  url: string
  fullText?: string
}

/**
 * Extract text content from HTML and clean it properly
 */
function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ")

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ")
  text = text.replace(/&amp;/g, "&")
  text = text.replace(/&lt;/g, "<")
  text = text.replace(/&gt;/g, ">")
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&apos;/g, "'")
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim()

  return text
}

/**
 * Extract title from HTML
 */
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  if (titleMatch) {
    return extractTextFromHTML(titleMatch[1])
  }

  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  if (h1Match) {
    return extractTextFromHTML(h1Match[1])
  }

  return "Untitled"
}

/**
 * Extract snippet from HTML (first paragraph or meta description)
 */
function extractSnippet(html: string): string {
  // Try meta description first
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
  if (metaMatch) {
    return metaMatch[1].substring(0, 300)
  }

  // Try first paragraph
  const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i)
  if (pMatch) {
    const text = extractTextFromHTML(pMatch[1])
    return text.substring(0, 300)
  }

  // Fallback to first 300 chars of body
  const fullText = extractTextFromHTML(html)
  return fullText.substring(0, 300)
}

/**
 * Scrape content from a URL using the API proxy
 */
export async function scrapeURL(url: string): Promise<ScrapedContent | null> {
  try {
    console.log(`[v0] Scraping URL via proxy: ${url}`)

    // Use API proxy to bypass CORS
    const response = await fetch("/api/proxy-fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      console.error(`[v0] Proxy fetch failed: ${response.status}`)
      return null
    }

    const html = await response.text()

    const title = extractTitle(html)
    const snippet = extractSnippet(html)
    const fullText = extractTextFromHTML(html)

    return {
      title,
      snippet,
      url,
      fullText: fullText.substring(0, 2000), // Limit to 2000 chars
    }
  } catch (error) {
    console.error(`[v0] Failed to scrape ${url}:`, error)
    return null
  }
}

/**
 * Crawl a domain-specific URL from webDocReferences
 */
export async function crawlDomainSource(url: string): Promise<ScrapedContent | null> {
  return await scrapeURL(url)
}
