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
   * Uses intelligent merging based on confidence scores and content quality.
   * @param inputs combined inputs including LLM output and domain results
   * @returns synthesized response object with confidence and sources
   */
  synthesize(inputs: {
    llmOutput: string
    domainOutputs: Array<{ domain: string; result: string }>
    originalPrompt: string
  }): SynthesizedResponse {
    const { llmOutput, domainOutputs, originalPrompt } = inputs
    const trimmedLlm = llmOutput?.trim() ?? ""
    const insights = this.buildDomainInsights(domainOutputs)

    const mergedResponse = this.composeNarrative(trimmedLlm, insights)
    if (mergedResponse) {
      const sources = insights.map((insight) => insight.domain)
      return {
        text: mergedResponse,
        confidence: this.estimateConfidence(Boolean(trimmedLlm), insights.length),
        sources,
        metadata: {
          combinedDomains: sources,
          responseLength: mergedResponse.length,
        },
      }
    }

    if (trimmedLlm) {
      return {
        text: trimmedLlm,
        confidence: this.estimateConfidence(true, 0),
        sources: [],
        metadata: {
          combinedDomains: [],
          responseLength: trimmedLlm.length,
        },
      }
    }

    const fallbackText = this.buildFallbackResponse(originalPrompt, domainOutputs)
    return {
      text: fallbackText,
      confidence: 0.35,
      sources: domainOutputs.map((d) => d.domain),
      metadata: {
        combinedDomains: domainOutputs.map((d) => d.domain),
        responseLength: fallbackText.length,
      },
    }
  }

  private buildDomainInsights(domainOutputs: Array<{ domain: string; result: string }>): DomainInsight[] {
    return domainOutputs
      .map(({ domain, result }) => {
        const cleaned = this.stripBoilerplate(result)
        if (!cleaned) {
          return null
        }
        return {
          domain,
          summary: this.extractSummary(cleaned),
          detail: cleaned,
        }
      })
      .filter(Boolean) as DomainInsight[]
  }

  private composeNarrative(llmOutput: string, insights: DomainInsight[]): string {
    const sections: string[] = []

    if (llmOutput.length > 0) {
      sections.push(llmOutput)
    }

    if (insights.length > 0) {
      const highlights = insights
        .map((insight) => `- **${this.formatDomainName(insight.domain)}:** ${insight.summary}`)
        .join("\n")
      sections.push(`Key findings:\n${highlights}`)

      const detailedInsights = insights
        .filter((insight) => insight.detail && insight.detail !== insight.summary)
        .map((insight) => `**${this.formatDomainName(insight.domain)} details:**\n${insight.detail}`)

      if (detailedInsights.length > 0) {
        sections.push(detailedInsights.join("\n\n"))
      }
    }

    return sections.join("\n\n").trim()
  }

  private stripBoilerplate(text: string): string {
    if (!text) {
      return ""
    }

    return text
      .replace(/Processing query:[^\n]*\n?/gi, "")
      .replace(/Domain response:?/gi, "")
      .replace(/\*{2}?Domain.*?\*{2}?/gi, "")
      .trim()
  }

  private extractSummary(text: string): string {
    const sentences = text.split(/(?<=[.!?])\s+/)
    const primary = sentences.find((sentence) => sentence && sentence.length > 25)
    return (primary ?? sentences[0] ?? text).trim()
  }

  private estimateConfidence(hasLlm: boolean, insightCount: number): number {
    const base = 0.55
    const llmBoost = hasLlm ? 0.15 : 0
    const insightBoost = Math.min(0.3, insightCount * 0.08)
    return Math.min(0.95, base + llmBoost + insightBoost)
  }

  private buildFallbackResponse(
    originalPrompt: string,
    domainOutputs: Array<{ domain: string; result: string }>,
  ): string {
    const attemptedDomains = domainOutputs.length
      ? domainOutputs.map((d) => this.formatDomainName(d.domain)).join(", ")
      : "the available knowledge domains"

    return `I couldn't produce a complete answer for "${originalPrompt}" yet. The system attempted to consult ${attemptedDomains}, but none of the engines returned usable data. Please rephrase the question with more context or try again in a moment while the models refresh.`
  }

  private formatDomainName(domain: string): string {
    return domain
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }
}

type DomainInsight = {
  domain: string
  summary: string
  detail: string
}
