/**
 * File: src/ai/data/registry.ts
 * Purpose: Central registry for domain plugins located under `src/ai/data/*`.
 */

export type DomainAPI = {
  name: string;
  version?: string;
  initialize?: () => Promise<void> | void;
  query?: (input: string, opts?: Record<string, unknown>) => Promise<unknown> | unknown;
  train?: (opts?: Record<string, unknown>) => Promise<unknown> | unknown;
};

const domains = new Map<string, DomainAPI>();

export const registerDomain = (api: DomainAPI) => {
  domains.set(api.name, api);
};

export const getDomain = (name: string): DomainAPI | null => domains.get(name) ?? null;

export const listDomains = () => Array.from(domains.values());
