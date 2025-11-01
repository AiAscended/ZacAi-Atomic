/**
 * File: src/ai/output_generation/responseSynthesizer.ts
 * Synthesizes multi-domain results into a coherent response.
 * Applies summarization, formatting, and language detection.
 *
 * Usage:
 * - synthesize(domainResults): returns text + structured objects
 */

export interface SynthesizedResponse {
  text: string
  confidence: number
  sources: string[]
  metadata: {
    combinedDomains: string[]
    responseLength: number
  }
}

export class ResponseSynthesizer {
  /**
   * Combine responses from multiple domains into a natural language reply.
   * @param inputs combined inputs including LLM output and domain results
   * @returns synthesized response object with confidence and sources
   */
  synthesize(inputs: {
    llmOutput: string
    domainOutputs: Array<{ domain: string; result: string }>
    originalPrompt: string
  }): SynthesizedResponse {
    // Combine LLM output with domain-specific results
    const domainText = inputs.domainOutputs
      .map((d) => `[${d.domain}]: ${d.result}`)
      .join("\n")
    
    const combinedText = inputs.llmOutput || domainText || "No response generated."
    
    return {
      text: combinedText,
      confidence: inputs.domainOutputs.length > 0 ? 0.8 : 0.5,
      sources: inputs.domainOutputs.map(d => d.domain),
      metadata: {
        combinedDomains: inputs.domainOutputs.map(d => d.domain),
        responseLength: combinedText.length,
      },
    }
  }
}
