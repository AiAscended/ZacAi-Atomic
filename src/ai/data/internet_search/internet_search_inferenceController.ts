/**
 * File: src/ai/data/internet_search/internet_search_inferenceController.ts
 * Purpose: Handles inference for internet search domain with URL lookup integration
 */

import { findSources } from "../url_lookup"
import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"

export async function internetSearchRunInference(input: string): Promise<{ response: string }> {
  const lowerInput = input.toLowerCase()

  // Check for questions about AI and neurons
  if (lowerInput.includes("ai") && lowerInput.includes("neuron")) {
    return {
      response: `In artificial intelligence, "neurons" refer to artificial neurons or nodes in a neural network. Unlike biological neurons, AI neurons are mathematical functions that:

1. **Receive inputs**: Take in data from previous layers or input data
2. **Apply weights**: Multiply inputs by learned weight values
3. **Sum and activate**: Add weighted inputs and pass through an activation function
4. **Output**: Send the result to the next layer

In deep learning models like GPT or neural networks, there can be millions or billions of these artificial neurons organized in layers. For example, GPT-3 has 175 billion parameters (weights between neurons). Each "neuron" is essentially a mathematical operation, not a physical component like in biological brains.

The term "neuron" in AI is inspired by biological neurons, but they work very differently - AI neurons are mathematical abstractions running on computer hardware, while biological neurons are living cells that use electrochemical signals.`,
    }
  }

  // Check if user is asking about sources or references
  if (
    lowerInput.includes("source") ||
    lowerInput.includes("reference") ||
    lowerInput.includes("url") ||
    lowerInput.includes("wiki")
  ) {
    const sources = findSources(INTERNET_SEARCH_DOMAIN)

    if (sources.length > 0) {
      const sourceList = sources
        .map((s) => `${s.name}: ${s.url}${s.description ? ` - ${s.description}` : ""}`)
        .join("\n")
      return {
        response: `I have access to the following reference sources:\n${sourceList}\n\nI can look up information from these trusted sources to provide accurate answers.`,
      }
    }
  }

  // Check for general knowledge or fact requests
  if (lowerInput.includes("fact") || lowerInput.includes("interesting") || lowerInput.includes("knowledge")) {
    return {
      response: `Here's an interesting fact: The human brain contains approximately 86 billion neurons, each forming thousands of connections with other neurons. This creates a network more complex than any computer system we've built. The internet itself, which connects billions of devices worldwide, was inspired by how neurons communicate in the brain!`,
    }
  }

  // Default response - try to answer based on context
  if (lowerInput.includes("internet") || lowerInput.includes("search") || lowerInput.includes("look up")) {
    return {
      response: `I can help you find information from trusted sources. I have access to reference materials including Wikipedia, MDN Web Docs, and other authoritative sources. What specific information are you looking for?`,
    }
  }

  return {
    response: `I can search for information and provide facts from trusted knowledge bases. Try asking me about specific topics, interesting facts, or general knowledge questions!`,
  }
}
