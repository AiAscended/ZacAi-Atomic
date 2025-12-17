/**
 * Internet Search Domain Tool: Web Scraper
 * Scrapes and extracts information from web pages
 */

import { normalizeText } from "../internet_search_utils"

type ScrapeMetadata = {
  domain: string
  scheme: string
  queryLength: number
}

type ScrapeResult = {
  content: string
  metadata: ScrapeMetadata
  links: string[]
}

const extractLinks = (content: string) => {
  const matches = content.match(/https?:\/\/\S+/g) ?? []
  return matches.slice(0, 5)
}

export class InternetSearchWebScraper {
  async scrape(url: string): Promise<ScrapeResult> {
    const metadata = this.buildMetadata(url)
    const simulatedContent = normalizeText(
      `Fetched placeholder content for ${metadata.domain}. This is a synthetic response used while live scraping is disabled.`,
    )

    return {
      content: simulatedContent,
      metadata,
      links: extractLinks(simulatedContent),
    }
  }

  private buildMetadata(rawUrl: string): ScrapeMetadata {
    try {
      const parsed = new URL(rawUrl)
      return {
        domain: parsed.hostname,
        scheme: parsed.protocol.replace(":", ""),
        queryLength: parsed.search.length,
      }
    } catch {
      return {
        domain: "invalid",
        scheme: "unknown",
        queryLength: 0,
      }
    }
  }
}

export default InternetSearchWebScraper
