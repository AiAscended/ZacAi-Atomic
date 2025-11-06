/**
 * File: src/ai/data/programming/programming_url_lookup.ts
 * Purpose: Provide URL references for programming documentation and resources
 * Depends on: programming_constants.ts
 * Depended on by: programming_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup"

export interface ProgrammingDocReference {
  title: string
  url: string
  topics: string[]
  description: string
}

export const PROGRAMMING_DOC_REFERENCES: ProgrammingDocReference[] = [
  {
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    topics: ["javascript", "web", "api"],
    description: "Comprehensive web development documentation",
  },
  {
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    topics: ["programming", "debugging", "community"],
    description: "Programming Q&A community",
  },
]

registerSource(
  "programming",
  "MDN Web Docs",
  "https://developer.mozilla.org",
  "Comprehensive web development documentation",
)
registerSource("programming", "Stack Overflow", "https://stackoverflow.com", "Programming Q&A community")
registerSource("programming", "DevDocs", "https://devdocs.io", "API documentation browser")
registerSource("programming", "freeCodeCamp", "https://www.freecodecamp.org", "Programming tutorials and examples")

export default () => registerSource
