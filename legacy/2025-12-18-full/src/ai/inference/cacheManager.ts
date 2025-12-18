/**
 * File: src/ai/inference/cacheManager.ts
 * Description: Minimal in-memory cache for inference artifacts (e.g. key-value cache for encodings).
 */

export class CacheManager<T> {
  private store = new Map<string, { value: T; ts: number }>();

  get(key: string): T | undefined {
    return this.store.get(key)?.value;
  }

  set(key: string, value: T) {
    this.store.set(key, { value, ts: Date.now() });
  }

  has(key: string) {
    return this.store.has(key);
  }

  clearOlderThan(ms: number) {
    const cutoff = Date.now() - ms;
    for (const [k, v] of this.store.entries())
      if (v.ts < cutoff) this.store.delete(k);
  }

  clear() {
    this.store.clear();
  }
}
