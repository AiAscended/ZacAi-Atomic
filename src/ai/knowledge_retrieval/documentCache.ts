/**
 * File: src/ai/knowledge_retrieval/documentCache.ts
 * Purpose: Simple in-memory document cache with TTL for KB documents.
 */

interface CacheEntry<T> {
  ts: number;
  value: T;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 1000 * 60 * 5; // 5 minutes

export const DocumentCache = {
  get<T = unknown>(key: string): T | null {
    const e = cache.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > DEFAULT_TTL) {
      cache.delete(key);
      return null;
    }
    return e.value as T;
  },
  set<T = unknown>(key: string, value: T) {
    cache.set(key, { ts: Date.now(), value });
  },
  clear() {
    cache.clear();
  },
  // Hook called by orchestrator when a domain's data changes.
  onDomainDataChanged(payload: { domain?: string; file?: string } | unknown) {
    try {
      if (!payload || typeof payload !== "object") {
        cache.clear();
        return;
      }
      // If domain present, clear cache entries that mention the domain in the key.
      // Keys are free-form; this is a conservative clearing strategy.
      // Use a safe, typed extraction for domain field
      const domain = (payload as Record<string, unknown>)["domain"] as
        | string
        | undefined;
      if (!domain) {
        cache.clear();
        return;
      }
      for (const k of Array.from(cache.keys())) {
        if (k.includes(domain)) cache.delete(k);
      }
    } catch (e) {
      // swallow
    }
  },
};

export default DocumentCache;
