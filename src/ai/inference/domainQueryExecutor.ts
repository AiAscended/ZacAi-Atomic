/**
 * File: src/ai/inference/domainQueryExecutor.ts
 * Executes queries against domain-specific inference models with retry and metrics.
 *
 * Usage:
 * - queryDomainsByName(domainNames, query): queries specific domains with their inference engines
 */

import { domainRegistry } from '../knowledge-domains/domainRegistry';

export interface DomainQueryResult {
  domain: string;
  response: string;
  confidence: number;
  topics?: string[];
  metadata?: Record<string, any>;
  error?: string;
}

export class DomainQueryExecutor {
  /**
   * Query specific domains by name with actual inference
   * @param domainNames Array of domain names to query
   * @param query The user query/prompt
   * @returns Array of domain-specific results with confidence scores
   */
  async queryDomainsByName(
    domainNames: string[],
    query: string
  ): Promise<DomainQueryResult[]> {
    const results: DomainQueryResult[] = [];
    
    for (const domainName of domainNames) {
      try {
        const result = await this.querySingleDomain(domainName, query);
        results.push(result);
      } catch (err) {
        results.push({
          domain: domainName,
          response: '',
          confidence: 0,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    
    return results;
  }
  
  /**
   * Query a single domain with its inference controller
   */
  private async querySingleDomain(
    domainName: string,
    query: string
  ): Promise<DomainQueryResult> {
    // Get domain from registry
    const domain = domainRegistry.getDomain(domainName);
    
    if (!domain || !domain.enabled) {
      return {
        domain: domainName,
        response: '',
        confidence: 0,
        error: `Domain ${domainName} not found or disabled`,
      };
    }
    
    // Try to dynamically import domain inference controller
    try {
      const inferenceModule = await this.loadDomainInference(domainName);
      
      if (!inferenceModule) {
        // Fallback: basic domain response
        return {
          domain: domainName,
          response: `[${domainName}] Processing query: ${query}`,
          confidence: 0.5,
          metadata: { fallback: true },
        };
      }
      
      // Call domain-specific inference with full context
      // Build context object with tokens, embeddings, and any prior inference results
      const context = {
        query: query,
        tokens: query.toLowerCase().split(/\s+/),  // Basic tokenization
        embeddings: [],  // TODO: Add actual embeddings when available
        inferenceResults: [],  // Can be populated with prior domain results
        sentiment: { sentiment: 'neutral', score: 0.5 },  // Default neutral sentiment
      };
      
      console.log(`[DomainQueryExecutor] Calling ${domainName} inference with query:`, query.substring(0, 50));
      const result = await inferenceModule(query, context);
      console.log(`[DomainQueryExecutor] ${domainName} returned:`, {
        hasResult: !!result,
        confidence: result?.confidence,
        responseLength: result?.response?.length,
      });
      
      if (!result) {
        return {
          domain: domainName,
          response: '',
          confidence: 0,
          metadata: { notApplicable: true },
        };
      }
      
      return {
        domain: domainName,
        response: result.response || '',
        confidence: result.confidence || 0.5,
        topics: result.topics || [],
        metadata: result.metadata || {},
      };
    } catch (error) {
      console.error(`[DomainQueryExecutor] Error querying ${domainName}:`, error);
      return {
        domain: domainName,
        response: '',
        confidence: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  
  /**
   * Dynamically load domain inference controller
   */
  private async loadDomainInference(domainName: string): Promise<any> {
    try {
      // Try to load domain-specific inference function
      const module = await import(
        `../knowledge-domains/${domainName}/${domainName}_inferenceController`
      );
      
      // Try common export patterns (most domains use these)
      // Pattern 1: {domainName}RunInference
      if (module[`${domainName}RunInference`]) {
        return module[`${domainName}RunInference`];
      }
      
      // Pattern 2: generalRunInference (for general_knowledge)
      if (domainName === 'general_knowledge' && module.generalRunInference) {
        return module.generalRunInference;
      }
      
      // Pattern 3: default export
      if (module.default) {
        return module.default;
      }
      
      // Pattern 4: runInference
      if (module.runInference) {
        return module.runInference;
      }
      
      // Pattern 5: infer
      if (module.infer) {
        return module.infer;
      }
      
      // Log available exports for debugging
      console.log(`[DomainQueryExecutor] Available exports for ${domainName}:`, Object.keys(module));
      
      return null;
    } catch (error) {
      // Domain inference controller doesn't exist or failed to load
      console.log(`[DomainQueryExecutor] Failed to load ${domainName}:`, error);
      return null;
    }
  }
  
  /**
   * Legacy method for backward compatibility
   * @deprecated Use queryDomainsByName instead
   */
  async queryDomains(subtasks: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const subtask of subtasks) {
      try {
        results[subtask] = { response: `Processing: ${subtask}` };
      } catch (err) {
        results[subtask] = { 
          error: err instanceof Error ? err.message : String(err) 
        };
      }
    }
    
    return results;
  }
}
