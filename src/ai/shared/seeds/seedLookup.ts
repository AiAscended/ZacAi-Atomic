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

import { seedRegistry, SeedEntry, SeedRawEntry } from './seedRegistry';

type ExampleSource = SeedRawEntry['examples'] | SeedRawEntry['example'];

function normalizeExamples(source?: ExampleSource): string[] {
  if (!source) return [];

  const arraySource = Array.isArray(source) ? source : [source];

  return arraySource
    .map(example => {
      if (typeof example === 'string') {
        return example;
      }
      if (example?.code) {
        return example.code;
      }
      if (example?.example) {
        return example.example;
      }
      if (example && 'description' in example && typeof example.description === 'string') {
        return example.description;
      }
      return JSON.stringify(example);
    })
    .filter((value): value is string => Boolean(value));
}

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
  const fullData = entry?.fullData;
  if (!fullData || typeof fullData !== 'object') return null;

  const definitionFields: Array<'definition' | 'description' | 'explanation'> = ['definition', 'description', 'explanation'];
  const dataRecord = fullData as Record<string, unknown>;

  for (const field of definitionFields) {
    const value = dataRecord[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

/**
 * Get examples for a concept
 */
export function getExamples(key: string, domain?: string): string[] {
  const entry = seedRegistry.lookup(key, domain);
  const fullData = entry?.fullData;
  if (!fullData || typeof fullData !== 'object') return [];

  const examplesCandidate = (fullData as Record<string, unknown>).examples ?? (fullData as Record<string, unknown>).example;
  const normalize = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (typeof record.code === 'string') return record.code;
      if (typeof record.example === 'string') return record.example;
    }
    return JSON.stringify(value);
  };
  
  if (Array.isArray(examplesCandidate)) {
    return examplesCandidate.map((item) => normalize(item));
  }

  if (typeof examplesCandidate === 'string') {
    return [examplesCandidate];
  }

  return [];
}

/**
 * Get related concepts/words
 */
export function getRelated(key: string, domain?: string): string[] {
  const entry = seedRegistry.lookup(key, domain);
  const related = entry?.fullData && typeof entry.fullData === 'object'
    ? (entry.fullData as Record<string, unknown>).related
    : undefined;

  if (!Array.isArray(related)) {
    return [];
  }

  return related.filter((item): item is string => typeof item === 'string');
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
  const relatedCandidates = main.fullData && typeof main.fullData === 'object'
    ? (main.fullData as Record<string, unknown>).related
    : undefined;

  if (Array.isArray(relatedCandidates)) {
    for (const candidate of relatedCandidates) {
      if (typeof candidate !== 'string') continue;
      const relSeed = seedRegistry.lookup(candidate, domain);
      if (relSeed) {
        result.related.push(relSeed);
      }
    }
  }
  
  return result;
}
