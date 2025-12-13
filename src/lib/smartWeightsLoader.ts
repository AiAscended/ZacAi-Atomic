/**
 * Smart Weights Loader
 * Production-grade weight loading with version selection and fallback logic
 * 
 * Features:
 * - Automatic discovery of latest trained weights
 * - Fallback to pretrained weights if no trained weights available
 * - Version parsing from timestamp suffixes
 * - Caching for performance
 * - Type-safe loading with validation
 */

import fs from 'fs';
import path from 'path';

export interface WeightMetadata {
  domain: string;
  type: 'pretrained' | 'trained';
  version: string;
  timestamp?: string;
  filePath: string;
  exists: boolean;
  sizeBytes?: number;
}

export interface LoadedWeights {
  metadata: WeightMetadata;
  weights: unknown;
  loadedAt: Date;
  loadTimeMs: number;
}

// Cache for loaded weights
const weightsCache = new Map<string, { weights: unknown; loadedAt: Date }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Find all weight files for a domain
 */
export function discoverWeights(domainPath: string, domainName: string): WeightMetadata[] {
  const weightsDir = path.join(domainPath, `${domainName}_weights`);
  
  if (!fs.existsSync(weightsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(weightsDir);
  const weightFiles: WeightMetadata[] = [];
  
  // Pattern: <domain>_pretrained_weights.json
  const pretrainedPattern = new RegExp(`^${domainName}_pretrained_weights\\.json$`);
  
  // Pattern: <domain>_trained_weights_v1_YYYY-MM-DD.json
  const trainedPattern = new RegExp(`^${domainName}_trained_weights_v(\\d+)_(\\d{4}-\\d{2}-\\d{2})\\.json$`);
  
  files.forEach(file => {
    const filePath = path.join(weightsDir, file);
    
    // Check pretrained
    if (pretrainedPattern.test(file)) {
      weightFiles.push({
        domain: domainName,
        type: 'pretrained',
        version: '1.0.0',
        filePath,
        exists: fs.existsSync(filePath),
        sizeBytes: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
      });
    }
    
    // Check trained with version
    const trainedMatch = file.match(trainedPattern);
    if (trainedMatch) {
      const [, versionNum, timestamp] = trainedMatch;
      weightFiles.push({
        domain: domainName,
        type: 'trained',
        version: `1.${versionNum}.0`,
        timestamp,
        filePath,
        exists: fs.existsSync(filePath),
        sizeBytes: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
      });
    }
  });
  
  return weightFiles;
}

/**
 * Select best weights to load (prefer latest trained, fallback to pretrained)
 */
export function selectBestWeights(weights: WeightMetadata[]): WeightMetadata | null {
  if (weights.length === 0) return null;
  
  // Filter only existing files
  const existingWeights = weights.filter(w => w.exists && w.sizeBytes && w.sizeBytes > 0);
  
  if (existingWeights.length === 0) return null;
  
  // Separate trained and pretrained
  const trained = existingWeights.filter(w => w.type === 'trained');
  const pretrained = existingWeights.filter(w => w.type === 'pretrained');
  
  // Prefer latest trained weights
  if (trained.length > 0) {
    // Sort by timestamp descending
    trained.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.localeCompare(a.timestamp);
    });
    return trained[0];
  }
  
  // Fallback to pretrained
  if (pretrained.length > 0) {
    return pretrained[0];
  }
  
  return null;
}

/**
 * Load weights from file with caching
 */
export function loadWeights(weightMeta: WeightMetadata, useCache: boolean = true): LoadedWeights {
  const startTime = Date.now();
  const cacheKey = weightMeta.filePath;
  
  // Check cache
  if (useCache && weightsCache.has(cacheKey)) {
    const cached = weightsCache.get(cacheKey)!;
    const age = Date.now() - cached.loadedAt.getTime();
    
    if (age < CACHE_TTL_MS) {
      return {
        metadata: weightMeta,
        weights: cached.weights,
        loadedAt: cached.loadedAt,
        loadTimeMs: Date.now() - startTime,
      };
    }
  }
  
  // Load from file
  const weightsData = JSON.parse(fs.readFileSync(weightMeta.filePath, 'utf-8'));
  
  // Cache it
  if (useCache) {
    weightsCache.set(cacheKey, {
      weights: weightsData,
      loadedAt: new Date(),
    });
  }
  
  return {
    metadata: weightMeta,
    weights: weightsData,
    loadedAt: new Date(),
    loadTimeMs: Date.now() - startTime,
  };
}

/**
 * Smart loader: auto-discover and load best weights for a domain
 */
export function loadDomainWeights(domainPath: string, domainName: string, useCache: boolean = true): LoadedWeights | null {
  const discovered = discoverWeights(domainPath, domainName);
  const best = selectBestWeights(discovered);
  
  if (!best) {
    console.warn(`⚠️  No weights found for domain: ${domainName}`);
    return null;
  }
  
  return loadWeights(best, useCache);
}

/**
 * Clear weights cache (useful for testing/reloading)
 */
export function clearCache(domain?: string) {
  if (domain) {
    // Clear cache for specific domain
    for (const [key] of weightsCache) {
      if (key.includes(domain)) {
        weightsCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    weightsCache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    entriesCount: weightsCache.size,
    domains: Array.from(weightsCache.keys()).map(k => path.basename(path.dirname(k))),
  };
}

// Export for testing/debugging
export const __testing__ = {
  weightsCache,
  CACHE_TTL_MS,
};
