/**
 * File: src/ai/search-engine/contentExtractor.ts
 * Purpose: Extract and clean main content from web pages
 * Depends on: None (atomic module)
 * Depended on by: src/ai/search-engine/index.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Extract main content from HTML, removing boilerplate
 * @param html - Raw HTML content
 * @returns Cleaned main content
 */
export function extractMainContent(html: string): string {
  // Remove scripts, styles, and navigation
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");

  // Extract text from remaining HTML
  content = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return content;
}

/**
 * Extract metadata from HTML
 * @param html - Raw HTML content
 * @returns Metadata object
 */
export function extractMetadata(html: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Extract meta tags
  const metaMatches = html.matchAll(
    /<meta[^>]+name=["']([^"']+)["'][^>]+content=["']([^"']+)["']/gi,
  );
  for (const match of metaMatches) {
    metadata[match[1]] = match[2];
  }

  // Extract Open Graph tags
  const ogMatches = html.matchAll(
    /<meta[^>]+property=["']og:([^"']+)["'][^>]+content=["']([^"']+)["']/gi,
  );
  for (const match of ogMatches) {
    metadata[`og:${match[1]}`] = match[2];
  }

  return metadata;
}
