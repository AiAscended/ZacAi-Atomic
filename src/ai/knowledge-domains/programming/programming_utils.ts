import { PROGRAMMING_CONCEPTS } from "./programming_constants"

type ProgrammingConcept = (typeof PROGRAMMING_CONCEPTS)[number]
const CONCEPT_SET = new Set<string>(PROGRAMMING_CONCEPTS)

export function isProgrammingConcept(term: string): term is ProgrammingConcept {
  return CONCEPT_SET.has(term)
}

export function extractProgrammingTerms(text: string): string[] {
  const lowerText = text.toLowerCase()
  const terms: string[] = []

  for (const concept of PROGRAMMING_CONCEPTS) {
    if (lowerText.includes(concept)) {
      terms.push(concept)
    }
  }

  return [...new Set(terms)]
}
