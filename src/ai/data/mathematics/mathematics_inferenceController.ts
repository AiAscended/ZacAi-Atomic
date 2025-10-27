import { mathematicsTokenizer } from "./mathematics_tokenizer"
import { mathematicsSemanticAnalyzer } from "./mathematics_semanticAnalyzer"

export const mathematicsRunInference = async (input: string) => {
  const tk = mathematicsTokenizer(input)
  const sem = mathematicsSemanticAnalyzer(input)

  const lowerInput = input.toLowerCase()

  if (lowerInput.includes("fibonacci")) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response:
        "The Fibonacci sequence is a series where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34...",
    }
  }

  if (lowerInput.includes("prime")) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response:
        "Prime numbers are natural numbers greater than 1 that have no positive divisors other than 1 and themselves. Examples: 2, 3, 5, 7, 11, 13, 17, 19, 23...",
    }
  }

  if (lowerInput.includes("pi") || lowerInput.includes("π")) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response:
        "Pi (π) is approximately 3.14159265359. It represents the ratio of a circle's circumference to its diameter.",
    }
  }

  // Default mathematics response
  return {
    tokens: tk.tokens,
    tokenCount: tk.length,
    semantics: sem,
    response: `Mathematics domain processed your query about: "${input}". I can help with calculations, mathematical concepts, and problem-solving.`,
  }
}
