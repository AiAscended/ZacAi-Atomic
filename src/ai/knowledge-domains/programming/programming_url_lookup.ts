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

const REGISTERED_SOURCES: ProgrammingDocReference[] = [
  ...PROGRAMMING_DOC_REFERENCES,
  {
    title: "DevDocs",
    url: "https://devdocs.io",
    topics: ["api", "reference", "docs"],
    description: "API documentation browser",
  },
  {
    title: "freeCodeCamp",
    url: "https://www.freecodecamp.org",
    topics: ["tutorials", "javascript", "fullstack"],
    description: "Programming tutorials and examples",
  },
]

export function registerProgrammingDocumentationSources(): void {
  for (const reference of REGISTERED_SOURCES) {
    registerSource("programming", reference.title, reference.url, reference.description)
  }
}

registerProgrammingDocumentationSources()
