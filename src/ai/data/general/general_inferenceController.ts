import { generalTokenizer } from "./general_tokenizer"
import { generalSemanticAnalyzer } from "./general_semanticAnalyzer"

export const generalRunInference = async (input: string, context?: any) => {
  const t = generalTokenizer(input)
  const sem = generalSemanticAnalyzer(input)

  let responseText = ""

  // Check for greetings
  if (input.match(/\b(hi|hello|hey|greetings)\b/i)) {
    responseText = "Hello! I'm an AI assistant powered by a hybrid modular system. "
  }

  // Check for identity questions
  if (input.match(/\b(who are you|what are you|your name|tell me about you)\b/i)) {
    responseText +=
      "I'm ZacAi Atomic - a comprehensive hybrid modular AI system with specialized knowledge across 16 different domains including mathematics, programming, science, language analysis, and more. Each domain operates as an independent atomic module that collaborates through a central orchestrator. "
  }

  // Check for capability questions
  if (input.match(/\b(what can you do|capabilities|help)\b/i)) {
    responseText += "I can help with coding, mathematics, language analysis, internet searches, and much more. "
  }

  // Check for interesting facts request
  if (input.match(/\b(interesting|fact|tell me)\b/i)) {
    responseText +=
      "Here's something interesting: This AI system uses atomic modular architecture where each knowledge domain operates independently but can collaborate through a central orchestrator. "
  }

  // Check for general knowledge request
  if (input.match(/\b(general knowledge|common|most common|top.*fact)\b/i)) {
    responseText +=
      "A fascinating piece of general knowledge: The human brain processes information at approximately 120 meters per second, which is about 268 miles per hour! "
  }

  // Fallback if no specific patterns matched
  if (!responseText) {
    responseText = `I've analyzed your input using ${t.length} tokens and semantic analysis. I'm here to help with a wide range of topics across my 16 specialized knowledge domains.`
  }

  return {
    response: responseText.trim(),
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
  }
}
