import { tokenizeProgrammingInput, type TokenizedProgrammingInput } from "./programming_tokenizer"

export interface ProgrammingParseResult {
  type: "concept" | "syntax" | "debugging" | "design" | "algorithm" | "question" | "example" | "general"
  tokens: TokenizedProgrammingInput
  metadata: {
    language?: string
    paradigm?: string
    hasCode: boolean
  }
}

export function parseProgrammingInput(input: string): ProgrammingParseResult {
  const tokens = tokenizeProgrammingInput(input)
  const lowerInput = input.toLowerCase()

  const metadata = {
    language: undefined as string | undefined,
    paradigm: undefined as string | undefined,
    hasCode: /[{}();]/.test(input) || lowerInput.includes("code"),
  }

  // Detect language
  if (lowerInput.includes("javascript") || lowerInput.includes("js")) metadata.language = "javascript"
  else if (lowerInput.includes("typescript") || lowerInput.includes("ts")) metadata.language = "typescript"
  else if (lowerInput.includes("python")) metadata.language = "python"

  // Detect paradigm
  if (lowerInput.includes("object oriented") || lowerInput.includes("oop")) metadata.paradigm = "object-oriented"
  else if (lowerInput.includes("functional")) metadata.paradigm = "functional"

  let type: ProgrammingParseResult["type"] = "general"

  const exampleKeywords = ["example", "show me", "code snippet", "snippet", "demo"]

  if (exampleKeywords.some((keyword) => lowerInput.includes(keyword))) type = "example"
  else if (lowerInput.includes("concept") || lowerInput.includes("what is")) type = "concept"
  else if (lowerInput.includes("syntax") || lowerInput.includes("how to write")) type = "syntax"
  else if (lowerInput.includes("debug") || lowerInput.includes("error") || lowerInput.includes("bug"))
    type = "debugging"
  else if (lowerInput.includes("design pattern") || lowerInput.includes("architecture")) type = "design"
  else if (lowerInput.includes("algorithm") || lowerInput.includes("complexity")) type = "algorithm"
  else if (lowerInput.includes("?") || lowerInput.includes("how") || lowerInput.includes("what")) type = "question"

  return { type, tokens, metadata }
}
