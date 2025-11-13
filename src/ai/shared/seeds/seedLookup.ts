/**
 * Seed Lookup Utility
 * 
 * Provides easy access to seed registry for all system components.
 * Acts like a "mental reference" - quick lookups for vocabulary, concepts, definitions.
 * 
 * Use Cases:
 * - Orchestrator: Look up word meanings before routing
 * - Domains: Reference domain-specific concepts during inference
 * - Models: Supplement trained weights with explicit knowledge
 * - LLM Tokenizer: Get full context for unknown tokens
 */

import { seedRegistry, SeedEntry } from './seedRegistry';

/**
 * Quick lookup - like human vocabulary recall
 */
export async function lookupSeed(key: string, domain?: string): Promise<SeedEntry | null> {
  return seedRegistry.lookup(key, domain);
}

/**
 * Lookup by binary index (ultra-fast for known indices)
 */
export function lookupByBinary(domainId: number, fileId: number, entryId: number): SeedEntry | null {
  const binary = new Uint8Array([domainId, fileId, (entryId >> 8) & 0xFF, entryId & 0xFF]);
  return seedRegistry.lookupByBinary(binary);
}

/**
 * Get binary index for a word (for caching/optimization)
 */
export function getBinaryIndex(key: string, domain?: string): Uint8Array | null {
  return seedRegistry.getBinaryIndex(key, domain);
}

/**
 * Search seeds across all domains
 */
export function searchSeeds(
  query: string, 
  options?: { 
    domain?: string; 
    category?: string; 
    tags?: string[];
    limit?: number;
  }
): SeedEntry[] {
  const results = seedRegistry.search(query, options);
  
  if (options?.limit) {
    return results.slice(0, options.limit);
  }
  
  return results;
}

/**
 * Get all seeds for a specific domain
 */
export function getDomainSeeds(domainName: string): SeedEntry[] {
  return seedRegistry.getDomainEntries(domainName);
}

/**
 * Check if a word exists in seed vocabulary
 */
export function hasSeed(key: string, domain?: string): boolean {
  return seedRegistry.lookup(key, domain) !== null;
}

/**
 * Get full definition/explanation for a term
 */
export function getDefinition(key: string, domain?: string): string | null {
  const entry = seedRegistry.lookup(key, domain);
  if (!entry?.fullData) return null;
  
  return (entry.fullData as any)?.definition || (entry.fullData as any)?.description || (entry.fullData as any)?.explanation || null;
}

/**
 * Get examples for a concept
 */
export function getExamples(key: string, domain?: string): string[] {
  const entry = seedRegistry.lookup(key, domain);
  if (!entry?.fullData) return [];
  
  const examples = entry.fullData?.examples || entry.fullData?.example;
  
  if (Array.isArray(examples)) {
    return examples.map((ex: unknown) => {
      if (typeof ex === 'string') return ex;
      if (typeof ex === 'object' && ex !== null) {
        if ('code' in ex && typeof (ex as { code: unknown }).code === 'string') return (ex as { code: string }).code;
        if ('example' in ex && typeof (ex as { example: unknown }).example === 'string') return (ex as { example: string }).example;
      }
      return JSON.stringify(ex);
    });
  }
  
  if (typeof examples === 'string') return [examples];
  
  return [];
}

/**
 * Get related concepts/words
 */
export function getRelated(key: string, domain?: string): string[] {
  const entry = seedRegistry.lookup(key, domain);
  if (!entry?.fullData?.related) return [];
  
  return Array.isArray(entry.fullData?.related) ? entry.fullData?.related : [];
}

/**
 * Get all vocabulary as a simple list (for model training)
 */
export function getVocabularyList(): string[] {
  return seedRegistry.getVocabularyList();
}

/**
 * Get seed statistics
 */
export function getSeedStats() {
  return seedRegistry.getStats();
}

/**
 * Export complete seed index (for model initialization)
 */
export async function exportSeedIndex(outputPath: string): Promise<void> {
  await seedRegistry.exportBinaryIndex(outputPath);
}

/**
 * Batch lookup - for efficient multi-term lookups
 */
export function batchLookup(keys: string[], domain?: string): Map<string, SeedEntry | null> {
  const results = new Map<string, SeedEntry | null>();
  
  for (const key of keys) {
    results.set(key, seedRegistry.lookup(key, domain));
  }
  
  return results;
}

/**
 * Get seed context for a prompt (extract known seeds from text)
 */
export function extractSeedsFromPrompt(prompt: string, domain?: string): SeedEntry[] {
  const words = prompt.toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^\w]/g, ''));
  
  const foundSeeds: SeedEntry[] = [];
  const seen = new Set<string>();
  
  for (const word of words) {
    if (seen.has(word)) continue;
    
    const seed = seedRegistry.lookup(word, domain);
    if (seed) {
      foundSeeds.push(seed);
      seen.add(word);
    }
  }
  
  return foundSeeds;
}

/**
 * Enhanced lookup with fallback to related terms
 */
export function lookupWithContext(key: string, domain?: string): {
  main: SeedEntry | null;
  related: SeedEntry[];
  similar: SeedEntry[];
} {
  const main = seedRegistry.lookup(key, domain);
  
  const result = {
    main,
    related: [] as SeedEntry[],
    similar: [] as SeedEntry[]
  };
  
  if (!main) {
    // Try fuzzy search
    result.similar = seedRegistry.search(key, { domain }).slice(0, 5);
    return result;
  }
  
  // Get related terms
  const relatedKeys = Array.isArray((main.fullData as any)?.related) ? (main.fullData as any).related : [];
  for (const relKey of relatedKeys) {
    const relSeed = seedRegistry.lookup(relKey, domain);
    if (relSeed) {
      result.related.push(relSeed);
    }
  }
  
  return result;
}
