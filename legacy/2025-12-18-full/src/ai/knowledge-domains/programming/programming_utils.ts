import { PROGRAMMING_CONCEPTS } from "./programming_constants";

export function isProgrammingConcept(term: string): boolean {
  return PROGRAMMING_CONCEPTS.includes(term as any);
}

export function extractProgrammingTerms(text: string): string[] {
  const lowerText = text.toLowerCase();
  const terms: string[] = [];

  for (const concept of PROGRAMMING_CONCEPTS) {
    if (lowerText.includes(concept)) {
      terms.push(concept);
    }
  }

  return [...new Set(terms)];
}
