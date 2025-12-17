/**
 * File: src/ai/inference/domainQueryExecutor.ts
 * Executes queries against domain-specific inference modules with diagnostics
 * and automated recovery attempts backed by the unified loader/registry stack.
 */

import { domainRegistry } from "../knowledge-domains/domainRegistry";

export interface DomainQueryResult {
  domain: string;
  response: string;
  confidence: number;
  topics?: string[];
  metadata?: Record<string, unknown>;
  error?: string;
  status?: 'ready' | 'loading' | 'error' | 'disabled' | 'unavailable';
  diagnostics?: {
    attempts: Array<{
      action: string;
      outcome: 'success' | 'failure';
      timestamp: number;
      detail?: string;
    }>;
    notes?: string;
    suggestions?: string[];
  };
}

type DomainInferenceContext = {
  query: string;
  tokens: string[];
  embeddings: number[][] | [];
  inferenceResults: unknown[];
  sentiment: { sentiment: string; score: number };
};

type DomainInferenceOutput = {
  response?: string;
  confidence?: number;
  topics?: string[];
  metadata?: Record<string, unknown>;
} | null | undefined;

type DomainInferenceHandler = (
  query: string,
  context: DomainInferenceContext
) => Promise<DomainInferenceOutput> | DomainInferenceOutput;

export class DomainQueryExecutor {
  /**
   * Query specific domains by name with actual inference
   * @param domainNames Array of domain names to query
   * @param query The user query/prompt
   * @returns Array of domain-specific results with confidence scores
   */
  async queryDomainsByName(
    domainNames: string[],
    query: string,
  ): Promise<DomainQueryResult[]> {
    const results: DomainQueryResult[] = [];

    for (const domainName of domainNames) {
      try {
        const result = await this.querySingleDomain(domainName, query);
        results.push(result);
      } catch (error) {
        results.push({
          domain: domainName,
          response: "",
          confidence: 0,
          error: error instanceof Error ? error.message : String(error),
          diagnostics: {
            attempts: [
              {
                action: 'query_domain',
                outcome: 'failure',
                timestamp: Date.now(),
                detail: error instanceof Error ? error.message : String(error),
              },
            ],
            notes: 'Unhandled exception while querying domain.',
          },
        });
      }
    };

    if (!parallel) {
      const sequentialResults: DomainQueryResult[] = [];
      for (const domainName of sanitizedDomains) {
        sequentialResults.push(await runDomainQuery(domainName));
      }
      return sequentialResults;
    }

    return results;
  }

  /**
   * Query a single domain with its inference controller
   */
  private async querySingleDomain(
    domainName: string,
    query: string,
  ): Promise<DomainQueryResult> {
    // Get domain from registry
    const domain = domainRegistry.getDomain(domainName);

    if (!domain || !domain.enabled) {
      diagnostics.notes = `Domain ${domainName} is not registered or is disabled.`;
      diagnostics.suggestions = [
        `Enable ${domainName} in the domain registry and redeploy the unified manifest.`,
        'Re-run the unified registry scan if the module was recently added.',
      ];
      return {
        domain: domainName,
        response: "",
        confidence: 0,
        error: `Domain ${domainName} not found or disabled`,
        status: 'unavailable',
        diagnostics,
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
        tokens: query.toLowerCase().split(/\s+/), // Basic tokenization
        embeddings: [], // TODO: Add actual embeddings when available
        inferenceResults: [], // Can be populated with prior domain results
        sentiment: { sentiment: "neutral", score: 0.5 }, // Default neutral sentiment
      };

      console.log(
        `[DomainQueryExecutor] Calling ${domainName} inference with query:`,
        query.substring(0, 50),
      );
      const result = await inferenceModule(query, context);
      console.log(`[DomainQueryExecutor] ${domainName} returned:`, {
        hasResult: !!result,
        confidence: result?.confidence,
        responseLength: result?.response?.length,
      });

      if (!result) {
        return {
          domain: domainName,
          response: "",
          confidence: 0,
          status: moduleStatus ?? 'unavailable',
          metadata: { fallback: true },
          diagnostics,
          error: `Inference handler unavailable for ${domainName}`,
        };
      }

      return {
        domain: domainName,
        response: result.response || "",
        confidence: result.confidence || 0.5,
        topics: result.topics || [],
        metadata: result.metadata || {},
        status: moduleStatus ?? 'ready',
        diagnostics,
      };
    } catch (error) {
      console.error(
        `[DomainQueryExecutor] Error querying ${domainName}:`,
        error,
      );
      return {
        domain: domainName,
        response: "",
        confidence: 0,
        error: error instanceof Error ? error.message : String(error),
        status: recovered ? 'error' : moduleStatus ?? 'error',
        diagnostics,
      };
    }
  }

  /**
   * Dynamically load domain inference controller
   */
  private async loadDomainInference(domainName: string): Promise<any> {
    try {
      // Try to load domain-specific inference function
      const moduleItem = await import(
        `../knowledge-domains/${domainName}/${domainName}_inferenceController`
      );

      // Try common export patterns (most domains use these)
      // Pattern 1: {domainName}RunInference
      if (moduleItem[`${domainName}RunInference`]) {
        return moduleItem[`${domainName}RunInference`];
      }

      // Pattern 2: generalRunInference (for general_knowledge)
      if (
        domainName === "general_knowledge" &&
        moduleItem.generalRunInference
      ) {
        return moduleItem.generalRunInference;
      }

      // Pattern 3: default export
      if (moduleItem.default) {
        return moduleItem.default;
      }

      // Pattern 4: runInference
      if (moduleItem.runInference) {
        return moduleItem.runInference;
      }

      // Pattern 5: infer
      if (moduleItem.infer) {
        return moduleItem.infer;
      }

      // Log available exports for debugging
      console.log(
        `[DomainQueryExecutor] Available exports for ${domainName}:`,
        Object.keys(moduleItem),
      );

      return null;
    } catch (error) {
      diagnostics?.attempts.push({
        action: 'load_module',
        outcome: 'failure',
        timestamp: Date.now(),
        detail: error instanceof Error ? error.message : String(error),
      });
      logEvent('domain.module_load_failed', {
        domain: domainName,
        message: error instanceof Error ? error.message : String(error),
      });
      return 'error';
    }
  }

  private async getInferenceHandler(
    domainName: string,
    diagnostics: DomainQueryResult['diagnostics'],
    bustCache = false
  ): Promise<DomainInferenceHandler | null> {
    if (!bustCache && this.inferenceCache.has(domainName)) {
      return this.inferenceCache.get(domainName) ?? null;
    }

    const handler = await this.loadDomainInference(domainName, diagnostics);
    if (handler) {
      this.inferenceCache.set(domainName, handler);
      diagnostics?.attempts.push({
        action: 'load_inference_handler',
        outcome: 'success',
        timestamp: Date.now(),
      });
    }
    return handler;
  }

  private async loadDomainInference(
    domainName: string,
    diagnostics: DomainQueryResult['diagnostics']
  ): Promise<DomainInferenceHandler | null> {
    try {
      const manifest = await this.getDomainManifest(domainName);
      let importPath: string | null = null;

      if (manifest?.paths?.inferenceEnginePath) {
        const trimmed = manifest.paths.inferenceEnginePath.replace(/\.(ts|js)x?$/, '');
        importPath = `../knowledge-domains/${domainName}/${trimmed}`;
      }

      const module = await import(
        importPath ?? `../knowledge-domains/${domainName}/${domainName}_inferenceController`
      );

      const handler = this.resolveInferenceExport(domainName, module);
      if (!handler) {
        diagnostics?.attempts.push({
          action: 'resolve_inference_export',
          outcome: 'failure',
          timestamp: Date.now(),
          detail: `Available exports: ${Object.keys(module).join(', ')}`,
        });
      }
      return handler;
    } catch (error) {
      diagnostics?.attempts.push({
        action: 'load_inference_module',
        outcome: 'failure',
        timestamp: Date.now(),
        detail: error instanceof Error ? error.message : String(error),
      });
      console.log(`[DomainQueryExecutor] Failed to load ${domainName}:`, error);
      return null;
    }

    const typedHandler = handler as DomainInferenceFn;
    this.inferenceCache.set(domainName, typedHandler);
    return typedHandler;
  }

  /**
   * Legacy method for backward compatibility.
   * @deprecated Use queryDomainsByName instead.
   */
  async queryDomains(subtasks: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const subtask of subtasks) {
      try {
        results[subtask] = { response: `Processing: ${subtask}` };
      } catch (err) {
        results[subtask] = {
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    return results;
  }
}
