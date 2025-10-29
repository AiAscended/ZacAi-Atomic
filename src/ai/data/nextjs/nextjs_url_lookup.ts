/**
 * File: src/ai/data/nextjs/nextjs_url_lookup.ts
 * Purpose: Provide URL references for Next.js documentation and resources
 * Depends on: nextjs_constants.ts
 * Depended on by: nextjs_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export interface NextjsDocReference {
  title: string
  url: string
  topics: string[]
  description: string
}

export const NEXTJS_DOC_REFERENCES: NextjsDocReference[] = [
  {
    title: "Next.js Documentation",
    url: "https://nextjs.org/docs",
    topics: ["general", "getting-started"],
    description: "Official Next.js documentation",
  },
  {
    title: "App Router Documentation",
    url: "https://nextjs.org/docs/app",
    topics: ["app-router", "server-components", "routing"],
    description: "Complete guide to the Next.js App Router",
  },
  {
    title: "Data Fetching",
    url: "https://nextjs.org/docs/app/building-your-application/data-fetching",
    topics: ["data-fetching", "server-components", "caching"],
    description: "Learn about data fetching patterns in Next.js",
  },
  {
    title: "Deployment",
    url: "https://nextjs.org/docs/deployment",
    topics: ["deployment", "vercel", "production"],
    description: "Deploy your Next.js application",
  },
]

export function findNextjsDocumentation(query: string): NextjsDocReference[] {
  const lowerQuery = query.toLowerCase()
  return NEXTJS_DOC_REFERENCES.filter(
    (ref) =>
      ref.title.toLowerCase().includes(lowerQuery) ||
      ref.description.toLowerCase().includes(lowerQuery) ||
      ref.topics.some((topic) => topic.toLowerCase().includes(lowerQuery)),
  )
}
