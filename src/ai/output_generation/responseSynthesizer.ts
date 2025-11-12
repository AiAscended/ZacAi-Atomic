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
    const { llmOutput, domainOutputs, originalPrompt } = inputs;
    
    // Filter out empty or low-quality domain results
    const validDomainOutputs = domainOutputs.filter(
      d => d.result && d.result.trim().length > 0 && !d.result.includes('[object Object]')
    );
    
    // Strategy 1: If we have high-quality domain results, prioritize them
    if (validDomainOutputs.length > 0) {
      // Check if domain results are substantial (not just echoes)
      const substantialResults = validDomainOutputs.filter(
        d => d.result.length > 50 && !d.result.includes('Processing query:')
      );
      
      if (substantialResults.length > 0) {
        // Use domain-specific knowledge
        const domainText = substantialResults
          .map(d => this.formatDomainResult(d))
          .join('\n\n');
        
        // Optionally prepend LLM context if it adds value
        const finalText = llmOutput && llmOutput.length > 20
          ? `${llmOutput}\n\n**Domain-Specific Knowledge:**\n${domainText}`
          : domainText;
        
        return {
          text: finalText,
          confidence: 0.85, // High confidence with domain expertise
          sources: substantialResults.map(d => d.domain),
          metadata: {
            combinedDomains: substantialResults.map(d => d.domain),
            responseLength: finalText.length,
          },
        };
      }
    }
    
    // Strategy 2: Use LLM output as primary if available
    if (llmOutput && llmOutput.trim().length > 0) {
      // Add domain context if available
      const domainContext = validDomainOutputs.length > 0
        ? `\n\n*Based on ${validDomainOutputs.map(d => d.domain).join(', ')} knowledge*`
        : '';
      
      return {
        text: llmOutput + domainContext,
        confidence: validDomainOutputs.length > 0 ? 0.75 : 0.6,
        sources: validDomainOutputs.map(d => d.domain),
        metadata: {
          combinedDomains: validDomainOutputs.map(d => d.domain),
          responseLength: llmOutput.length,
        },
      };
    }
    
    // Strategy 3: Fallback to basic response with helpful message
    console.warn("[ResponseSynthesizer] No valid LLM or domain outputs, using fallback");
    const fallbackText = `I understand you're asking about: "${originalPrompt}". 

I'm processing your request, but the AI models are still being trained. Here's what I can tell you:

- The system identified ${domainOutputs.length} relevant knowledge domain(s)
- Your query has been processed and logged for training
- More detailed responses will be available as the models improve

Please try again with a different question, or check back later as the system continues learning.`;
    
    return {
      text: fallbackText,
      confidence: 0.3,
      sources: domainOutputs.map(d => d.domain),
      metadata: {
        combinedDomains: domainOutputs.map(d => d.domain),
        responseLength: fallbackText.length,
      },
    };
  }
  
  /**
   * Format a single domain result for display
   */
  private formatDomainResult(domainOutput: { domain: string; result: string }): string {
    const domainName = this.formatDomainName(domainOutput.domain);
    
    // If result already includes formatting, use as-is
    if (domainOutput.result.includes('\n') || domainOutput.result.length > 200) {
      return `**${domainName}:**\n${domainOutput.result}`;
    }
    
    // Otherwise, simple format
    return `**${domainName}:** ${domainOutput.result}`;
  }
  
  /**
   * Format domain name for display
   */
  private formatDomainName(domain: string): string {
    return domain
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
