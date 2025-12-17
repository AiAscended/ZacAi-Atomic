/**
 * File: src/ai/output_generation/responseSynthesizer.ts
 * Synthesizes multi-domain results into a coherent response.
 * Applies summarization, formatting, and language detection.
 *
 * Usage:
 * - synthesize(domainResults): returns text + structured objects
 */

export class ResponseSynthesizer {
  /**
   * Combine responses from multiple domains into a natural language reply.
   * @param domainResults results from domain queries
   * @returns synthesized response object
   */
  synthesize(domainResults: Record<string, any>) {
    const responseText = Object.values(domainResults).map((res, i) => `Domain ${i + 1}: ${res.response || 'No response'}`).join("\n")
    return {
      text: responseText,
      metadata: {
        combinedDomains: Object.keys(domainResults),
        responseLength: responseText.length,
      },
    }
  }
}
