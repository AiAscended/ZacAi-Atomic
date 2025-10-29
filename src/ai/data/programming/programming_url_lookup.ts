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
