/**
 * File: src/ai/inference/domainQueryExecutor.ts
 * Executes queries against domain-specific inference models with retry and metrics.
 *
 * Usage:
 * - queryDomainsByName(domainNames, query): queries specific domains with their inference engines
 */

import { domainRegistry } from '../knowledge-domains/domainRegistry';
import { getUnifiedLoader } from '../shared/loader/unifiedLoader';

type DomainInferenceOutput = Partial<Omit<DomainQueryResult, 'domain'>> & {
  error?: string
} | null | undefined;

export interface DomainInferenceContext {
  query: string;
  tokens: string[];
  embeddings: number[][];
  inferenceResults: DomainQueryResult[];
  sentiment: {
    sentiment: string;
    score: number;
  };
  [key: string]: unknown;
}

type DomainInferenceFn = (
  query: string,
  context: DomainInferenceContext
) => DomainInferenceOutput | Promise<DomainInferenceOutput>;

export interface DomainQueryOptions {
  parallel?: boolean;
  timeoutMs?: number;
  context?: Partial<DomainInferenceContext>;
}

export interface DomainQueryResult {
  domain: string;
  response: string;
  confidence: number;
  topics?: string[];
  metadata?: Record<string, unknown>;
  error?: string;
}

export class DomainQueryExecutor {
  private inferenceCache: Map<string, DomainInferenceFn | null> = new Map();
  private loader = getUnifiedLoader();
  private defaultTimeoutMs = 8000;

  /**
   * Query specific domains by name with actual inference
   * @param domainNames Array of domain names to query
   * @param query The user query/prompt
   * @returns Array of domain-specific results with confidence scores
   */
  async queryDomainsByName(
    domainNames: string[],
    query: string,
    options: DomainQueryOptions = {}
  ): Promise<DomainQueryResult[]> {
    const sanitizedDomains = domainNames.filter(Boolean);
    const parallel = options.parallel ?? true;

    const runDomainQuery = async (domainName: string): Promise<DomainQueryResult> => {
      try {
        return await this.querySingleDomain(domainName, query, options);
      } catch (err) {
        return {
          domain: domainName,
          response: '',
          confidence: 0,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    };

    if (!parallel) {
      const sequentialResults: DomainQueryResult[] = [];
      for (const domainName of sanitizedDomains) {
        sequentialResults.push(await runDomainQuery(domainName));
      }
      return sequentialResults;
    }

    return await Promise.all(sanitizedDomains.map(runDomainQuery));
  }
  
  /**
   * Query a single domain with its inference controller
   */
  private async querySingleDomain(
    domainName: string,
    query: string,
    options: DomainQueryOptions
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
      const context: DomainInferenceContext = {
        query: query,
        tokens: query.toLowerCase().split(/\s+/),  // Basic tokenization
        embeddings: [],  // TODO: Add actual embeddings when available
        inferenceResults: [],  // Can be populated with prior domain results
        sentiment: { sentiment: 'neutral', score: 0.5 },  // Default neutral sentiment
        ...(options.context ?? {}),
      };
      
      const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
      const start = Date.now();
      console.log(`[DomainQueryExecutor] Calling ${domainName} inference with query:`, query.substring(0, 50));
      const result = await this.withTimeout(
        Promise.resolve(inferenceModule(query, context)),
        timeoutMs,
        domainName
      );
      const duration = Date.now() - start;
      console.log(`[DomainQueryExecutor] ${domainName} returned in ${duration}ms`, {
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
        confidence: result.confidence ?? 0.5,
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
  private async loadDomainInference(domainName: string): Promise<DomainInferenceFn | null> {
    if (this.inferenceCache.has(domainName)) {
      return this.inferenceCache.get(domainName) ?? null;
    }

    const handler = await this.loader.getDomainInferenceHandler(domainName);
    if (typeof handler !== 'function') {
      console.warn(`[DomainQueryExecutor] No inference handler registered for ${domainName}`);
      this.inferenceCache.set(domainName, null);
      return null;
    }

    const typedHandler = handler as DomainInferenceFn;
    this.inferenceCache.set(domainName, typedHandler);
    return typedHandler;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, domainName: string): Promise<T> {
    if (!timeoutMs || timeoutMs <= 0) {
      return promise;
    }

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Domain ${domainName} inference timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
  
  /**
   * Legacy method for backward compatibility
   * @deprecated Use queryDomainsByName instead
   */
  async queryDomains(subtasks: string[]): Promise<Record<string, { response?: string; error?: string }>> {
    const results: Record<string, { response?: string; error?: string }> = {};
    
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
