/**
 * File: app/api/proxy-fetch/route.ts
 * Purpose: API proxy to bypass CORS restrictions when fetching external URLs
 * Depends on: None
 * Depended on by: src/ai/shared/tools/webScraper.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Malformed URL" }, { status: 400 })
    }

    console.log(`[v0] Proxy fetching: ${url}`)

    // Fetch the URL with appropriate headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ZacAi-Atomic/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Fetch failed: ${response.status}` }, { status: response.status })
    }

    const content = await response.text()

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy fetch error:", error)
    return NextResponse.json({ error: "Proxy fetch failed" }, { status: 500 })
  }
}
