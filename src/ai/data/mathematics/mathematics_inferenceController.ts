import { mathematicsTokenizer } from "./mathematics_tokenizer"
import { mathematicsSemanticAnalyzer } from "./mathematics_semanticAnalyzer"
import { calculator } from "../../scientific-calculator/ScientificCalculator"
import { findSources } from "../url_lookup"
import { MATHEMATICS_DOMAIN } from "./mathematics_constants"

export const mathematicsRunInference = async (input: string) => {
  const tk = mathematicsTokenizer(input)
  const sem = mathematicsSemanticAnalyzer(input)

  const lowerInput = input.toLowerCase()

  // Check for calculation requests
  if (lowerInput.includes("calculate") || lowerInput.includes("compute") || lowerInput.includes("solve")) {
    // Try to extract and evaluate mathematical expressions
    const mathPattern = /(\d+\.?\d*)\s*([+\-*/^])\s*(\d+\.?\d*)/g
    const matches = input.match(mathPattern)

    if (matches) {
      try {
        const result = calculator.evaluate(matches[0])
        return {
          tokens: tk.tokens,
          tokenCount: tk.length,
          semantics: sem,
          response: `The result is ${result}. I used the scientific calculator to compute this.`,
        }
      } catch (error) {
        return {
          tokens: tk.tokens,
          tokenCount: tk.length,
          semantics: sem,
          response: `I detected a mathematical expression but couldn't evaluate it. Please check the syntax.`,
        }
      }
    }
  }

  // Check for requests about mathematical sources
  if (lowerInput.includes("source") || lowerInput.includes("reference")) {
    const sources = findSources(MATHEMATICS_DOMAIN)
    if (sources.length > 0) {
      const sourceList = sources.map((s) => `${s.name}: ${s.url}`).join(", ")
      return {
        tokens: tk.tokens,
        tokenCount: tk.length,
        semantics: sem,
        response: `I have access to mathematical references including: ${sourceList}`,
      }
    }
  }

  return {
    tokens: tk.tokens,
    tokenCount: tk.length,
    semantics: sem,
    response: sem.symbols.length
      ? `I detected ${sem.symbols.length} mathematical symbols. I can help with calculations, equations, trigonometry, logarithms, statistics, and more using my integrated scientific calculator.`
      : "I can help with mathematical calculations. Try asking me to calculate, solve, or compute something!",
  }
}
