/**
 * File: src/ai/inference/domainQueryExecutor.ts
 * Executes queries against domain-specific inference modules with diagnostics
 * and automated recovery attempts backed by the unified loader/registry stack.
 */

import { domainRegistry } from '../knowledge-domains/domainRegistry';
import { getUnifiedLoader, type LoadedModule } from '../shared/loader/unifiedLoader';
import { getUnifiedRegistry, type ModuleManifest } from '../shared/registry/unifiedRegistry';
import { logEvent } from '../../lib/systemActivityLogger';

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
  private loader = getUnifiedLoader();
  private inferenceCache = new Map<string, DomainInferenceHandler>();

  async queryDomainsByName(domainNames: string[], query: string): Promise<DomainQueryResult[]> {
    const results: DomainQueryResult[] = [];

    for (const domainName of domainNames) {
      try {
        const result = await this.querySingleDomain(domainName, query);
        results.push(result);
      } catch (error) {
        results.push({
          domain: domainName,
          response: '',
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

  private async querySingleDomain(domainName: string, query: string): Promise<DomainQueryResult> {
    const diagnostics: DomainQueryResult['diagnostics'] = { attempts: [] };
    const domain = domainRegistry.getDomain(domainName);

    if (!domain || !domain.enabled) {
      diagnostics.notes = `Domain ${domainName} is not registered or is disabled.`;
      diagnostics.suggestions = [
        `Enable ${domainName} in the domain registry and redeploy the unified manifest.`,
        'Re-run the unified registry scan if the module was recently added.',
      ];
      return {
        domain: domainName,
        response: '',
        confidence: 0,
        error: `Domain ${domainName} not found or disabled`,
        status: 'unavailable',
        diagnostics,
      };
    }

    const moduleStatus = await this.ensureDomainModule(domainName, diagnostics);

    try {
      const handler = await this.getInferenceHandler(domainName, diagnostics);

      if (!handler) {
        diagnostics.notes = `No inference handler exported for ${domainName}.`;
        diagnostics.suggestions = diagnostics.suggestions || [
          `Verify ${domainName} exports a callable inference function (e.g. ${domainName}RunInference).`,
          `Confirm ${domainName} inference controller path matches the unified registry manifest.`,
        ];
        return {
          domain: domainName,
          response: '',
          confidence: 0,
          status: moduleStatus ?? 'unavailable',
          metadata: { fallback: true },
          diagnostics,
          error: `Inference handler unavailable for ${domainName}`,
        };
      }

      const context: DomainInferenceContext = {
        query,
        tokens: query.toLowerCase().split(/\s+/),
        embeddings: [],
        inferenceResults: [],
        sentiment: { sentiment: 'neutral', score: 0.5 },
      };

      const result = await handler(query, context);
      diagnostics.attempts.push({ action: 'execute_inference', outcome: 'success', timestamp: Date.now() });

      if (!result) {
        diagnostics.notes = `Domain ${domainName} returned an empty response.`;
        return {
          domain: domainName,
          response: '',
          confidence: 0,
          status: moduleStatus ?? 'ready',
          metadata: { notApplicable: true },
          diagnostics,
        };
      }

      return {
        domain: domainName,
        response: result.response || '',
        confidence: result.confidence ?? 0.5,
        topics: result.topics || [],
        metadata: result.metadata || {},
        status: moduleStatus ?? 'ready',
        diagnostics,
      };
    } catch (error) {
      diagnostics.attempts.push({
        action: 'execute_inference',
        outcome: 'failure',
        timestamp: Date.now(),
        detail: error instanceof Error ? error.message : String(error),
      });
      logEvent('domain.inference_failure', {
        domain: domainName,
        message: error instanceof Error ? error.message : String(error),
      });

      const recovered = await this.tryHotReload(domainName, diagnostics);
      if (recovered) {
        try {
          const handler = await this.getInferenceHandler(domainName, diagnostics, true);
          if (handler) {
            const retryContext: DomainInferenceContext = {
              query,
              tokens: query.toLowerCase().split(/\s+/),
              embeddings: [],
              inferenceResults: [],
              sentiment: { sentiment: 'neutral', score: 0.5 },
            };
            const retryResult = await handler(query, retryContext);
            diagnostics.attempts.push({
              action: 'retry_after_reload',
              outcome: retryResult ? 'success' : 'failure',
              timestamp: Date.now(),
              detail: retryResult ? undefined : 'Retry returned empty response.',
            });

            if (retryResult) {
              diagnostics.notes = `Auto-recovery succeeded for ${domainName}.`;
              return {
                domain: domainName,
                response: retryResult.response || '',
                confidence: retryResult.confidence ?? 0.55,
                topics: retryResult.topics || [],
                metadata: retryResult.metadata || {},
                status: 'ready',
                diagnostics,
              };
            }
          }
        } catch (retryError) {
          diagnostics.attempts.push({
            action: 'retry_after_reload',
            outcome: 'failure',
            timestamp: Date.now(),
            detail: retryError instanceof Error ? retryError.message : String(retryError),
          });
          logEvent('domain.retry_failure', {
            domain: domainName,
            message: retryError instanceof Error ? retryError.message : String(retryError),
          });
        }
      }

      diagnostics.notes = diagnostics.notes ?? `Domain ${domainName} failed to respond after automated recovery attempts.`;
      diagnostics.suggestions = diagnostics.suggestions || [
        `Inspect ${domainName} inference controller for runtime errors.`,
        'Confirm registry manifest paths and rebuild affected bundles.',
      ];

      return {
        domain: domainName,
        response: '',
        confidence: 0,
        error: error instanceof Error ? error.message : String(error),
        status: recovered ? 'error' : moduleStatus ?? 'error',
        diagnostics,
      };
    }
  }

  private async ensureDomainModule(
    domainName: string,
    diagnostics: DomainQueryResult['diagnostics']
  ): Promise<DomainQueryResult['status']> {
    let loaded: LoadedModule | null = this.loader.getLoadedModule(domainName);

    if (loaded?.status === 'ready' || loaded?.status === 'disabled') {
      diagnostics?.attempts.push({
        action: 'module_status_check',
        outcome: 'success',
        timestamp: Date.now(),
        detail: loaded.status,
      });
      return loaded.status;
    }

    try {
      loaded = await this.loader.loadModule(domainName);
      diagnostics?.attempts.push({
        action: 'load_module',
        outcome: loaded.status === 'ready' ? 'success' : 'failure',
        timestamp: Date.now(),
        detail: loaded.errorMessage,
      });
      return loaded.status;
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

  private resolveInferenceExport(domainName: string, module: Record<string, unknown>): DomainInferenceHandler | null {
    const normalizedName = domainName.replace(/[-\s]/g, '_');
    const exportsToCheck = [
      module[`${normalizedName}RunInference`],
      module[`${domainName}RunInference`],
      module.runInference,
      module.infer,
      module.default,
      module.execute,
    ];

    const handler = exportsToCheck.find((candidate) => typeof candidate === 'function');
    return (handler as DomainInferenceHandler | undefined) ?? null;
  }

  private async getDomainManifest(domainName: string): Promise<ModuleManifest | null> {
    try {
      const registry = await getUnifiedRegistry();
      return registry.modules[domainName] ?? null;
    } catch (error) {
      logEvent('domain.manifest_lookup_failed', {
        domain: domainName,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private async tryHotReload(
    domainName: string,
    diagnostics: DomainQueryResult['diagnostics']
  ): Promise<boolean> {
    diagnostics?.attempts.push({
      action: 'hot_reload',
      outcome: 'failure',
      timestamp: Date.now(),
    });

    try {
      const reloaded = await this.loader.reloadModule(domainName);
      diagnostics?.attempts.pop();
      diagnostics?.attempts.push({
        action: 'hot_reload',
        outcome: reloaded.status === 'ready' ? 'success' : 'failure',
        timestamp: Date.now(),
        detail: reloaded.errorMessage,
      });
      if (reloaded.status === 'ready') {
        this.inferenceCache.delete(domainName);
        logEvent('domain.hot_reload_success', { domain: domainName });
        return true;
      }
      return false;
    } catch (error) {
      diagnostics?.attempts.pop();
      diagnostics?.attempts.push({
        action: 'hot_reload',
        outcome: 'failure',
        timestamp: Date.now(),
        detail: error instanceof Error ? error.message : String(error),
      });
      logEvent('domain.hot_reload_failure', {
        domain: domainName,
        message: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
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
      } catch (error) {
        results[subtask] = {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return results;
  }
}
