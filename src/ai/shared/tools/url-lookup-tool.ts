/**
 * File: src/ai/shared/tools/url-lookup-tool.ts
 * Purpose: Centralized URL lookup tool for all domains
 * 
 * Architecture:
 * - Shared tool used by all domains
 * - Each domain provides its own URL sources
 * - Configurable via YAML/JSON/XML
 * - Rate limiting and caching
 * - Error handling and retry logic
 */

import * as fs from "fs/promises";
import * as path from "path";

type LookupData = string | number | boolean | null | Record<string, unknown> | Array<unknown>;

interface CacheEntry {
  data: LookupData;
  timestamp: number;
  ttl: number;
}

interface RateLimiterState {
  count: number;
  resetTime: number;
}

// ============================================================================
// Types
// ============================================================================

export interface URLSource {
  name: string;
  url: string;
  description?: string;
  enabled: boolean;
  priority: number; // 1 = highest
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  headers?: Record<string, string>;
  timeout?: number; // milliseconds
}

export interface DomainURLConfig {
  domainId: string;
  domainName: string;
  sources: URLSource[];
  defaultSource?: string;
  fallbackOrder?: string[];
  cacheEnabled: boolean;
  cacheTTL?: number; // seconds
}

export interface URLLookupResult {
  success: boolean;
  data?: unknown;
  source?: string;
  cached: boolean;
  timestamp: string;
  error?: string;
}

// ============================================================================
// URL Lookup Tool
// ============================================================================

export class URLLookupTool {
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();
  
  /**
   * Lookup URL with domain-specific configuration
   */
  async lookup(
    domainId: string,
    query: string,
    options?: {
      preferredSource?: string;
      useCache?: boolean;
      timeout?: number;
    }
  ): Promise<URLLookupResult> {
    try {
      // Load domain configuration
      const config = await this.loadDomainConfig(domainId);
      
      if (!config) {
        return {
          success: false,
          cached: false,
          timestamp: new Date().toISOString(),
          error: `No URL configuration found for domain: ${domainId}`,
        };
      }
      
      // Check cache first
      if (options?.useCache !== false && config.cacheEnabled) {
        const cached = this.getFromCache(domainId, query);
        if (cached) {
          return {
            success: true,
            data: cached,
            cached: true,
            timestamp: new Date().toISOString(),
          };
        }
      }
      
      // Determine source priority
      const sources = this.getSortedSources(config, options?.preferredSource);
      
      // Try each source in order
      for (const source of sources) {
        if (!source.enabled) continue;
        
        // Check rate limits
        if (source.rateLimit && !this.checkRateLimit(source.name, source.rateLimit)) {
          console.warn(`Rate limit exceeded for source: ${source.name}`);
          continue;
        }
        
        try {
          const result = await this.fetchFromSource(source, query, options?.timeout);
          
          // Cache successful result
          if (config.cacheEnabled && config.cacheTTL) {
            this.addToCache(domainId, query, result, config.cacheTTL);
          }
          
          return {
            success: true,
            data: result,
            source: source.name,
            cached: false,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`Failed to fetch from ${source.name}:`, message);
          continue;
        }
      }
      
      // All sources failed
      return {
        success: false,
        cached: false,
        timestamp: new Date().toISOString(),
        error: "All sources failed",
      };
    } catch (error) {
      return {
        success: false,
        cached: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * Load domain-specific URL configuration
   */
  private async loadDomainConfig(domainId: string): Promise<DomainURLConfig | null> {
    const configPath = path.join(
      process.cwd(),
      "src",
      "ai",
      "knowledge-domains",
      domainId,
      "url-lookup.json"
    );
    
    try {
      const content = await fs.readFile(configPath, "utf8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  
  /**
   * Sort sources by priority and preferred source
   */
  private getSortedSources(config: DomainURLConfig, preferredSource?: string): URLSource[] {
    const sources = [...config.sources];
    
    // Move preferred source to front
    if (preferredSource) {
      const index = sources.findIndex(s => s.name === preferredSource);
      if (index > 0) {
        const [preferred] = sources.splice(index, 1);
        sources.unshift(preferred);
      }
    } else {
      // Sort by priority
      sources.sort((a, b) => a.priority - b.priority);
    }
    
    return sources;
  }
  
  /**
   * Fetch data from URL source
   */
  private async fetchFromSource(
    source: URLSource,
    query: string,
    timeout?: number
  ): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout || source.timeout || 10000
    );
    
    try {
      const url = this.buildURL(source.url, query);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: source.headers || {},
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        const json = await response.json();
        return json as Record<string, unknown> | Array<unknown>;
      } else if (contentType?.includes("text/html")) {
        return await response.text();
      } else {
        return await response.text();
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  /**
   * Build URL with query parameters
   */
  private buildURL(baseURL: string, query: string): string {
    if (baseURL.includes("{query}")) {
      return baseURL.replace("{query}", encodeURIComponent(query));
    }
    
    const url = new URL(baseURL);
    url.searchParams.set("q", query);
    return url.toString();
  }
  
  /**
   * Check rate limits
   */
  private checkRateLimit(
    sourceName: string,
    limits: URLSource["rateLimit"]
  ): boolean {
    if (!limits) return true;
    
    const now = Date.now();
    const limiter = this.rateLimiters.get(sourceName);
    
    if (!limiter || now > limiter.resetTime) {
      // Reset rate limiter
      this.rateLimiters.set(sourceName, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
      return true;
    }
    
    if (limiter.count >= limits.requestsPerMinute) {
      return false;
    }
    
    limiter.count++;
    return true;
  }
  
  /**
   * Get from cache
   */
  private getFromCache(domainId: string, query: string): unknown | null {
    const key = `${domainId}:${query}`;
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * Add to cache
   */
  private addToCache(domainId: string, query: string, data: unknown, ttl: number): void {
    const key = `${domainId}:${query}`;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  /**
   * Clear cache for domain
   */
  clearCache(domainId?: string): void {
    if (domainId) {
      const keysToDelete: string[] = [];
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${domainId}:`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let toolInstance: URLLookupTool | null = null;

export function getURLLookupTool(): URLLookupTool {
  if (!toolInstance) {
    toolInstance = new URLLookupTool();
  }
  return toolInstance;
}
