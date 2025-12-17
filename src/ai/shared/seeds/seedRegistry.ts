/**
 * Seed Registry System
 * 
 * Central registry for all domain seed vocabularies with binary indexing.
 * Acts as a "mental reference" system - like a human's vocabulary recall.
 * 
 * Design Philosophy:
 * - Rich metadata seeds (full definitions, examples, context) stored in domain folders
 * - Binary index for O(1) lookup performance (domain_id, file_id, entry_id)
 * - Available to all layers: orchestration, inference, domains, models
 * - Loaded at initialization, queryable anytime
 * - Supports both trained weight inference AND conscious lookup reference
 * 
 * Binary Index Format: [domain_id, file_id, entry_id]
 * Example: [4, 9, 27] = domain 4, seed file 9, entry 27
 */

import fs from 'fs/promises';
import path from 'path';

function stripJsonComments(content: string): string {
  return content
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
}

/**
 * Seed entry in the registry
 */
export interface SeedEntry {
  // Binary index components
  domainId: number;
  fileId: number;
  entryId: number;
  
  // Quick lookup data
  word?: string;           // For vocabulary seeds
  concept?: string;        // For concept seeds (math, coding, etc.)
  term?: string;           // Generic term field
  
  // Metadata for fast filtering
  domain: string;
  category?: string;
  priority?: number;
  tags?: string[];
  
  // Full reference path
  filePath: string;
  
  // Full entry data (loaded on demand)
  fullData?: Record<string, unknown>;
}

/**
 * Binary index entry - ultra-compact
 * Stored as Uint8Array for performance
 */
export interface BinaryIndex {
  // Packed binary: [domainId(1 byte), fileId(1 byte), entryId(2 bytes)]
  binary: Uint8Array;
  
  // Quick string key for hash lookup
  key: string;  // The actual word/concept/term
}

/**
 * Seed Registry Manager
 * Singleton pattern for system-wide access
 */
class SeedRegistryManager {
  private static instance: SeedRegistryManager;
  
  // Main indices
  private entries: Map<string, SeedEntry> = new Map();  // key -> full entry
  private binaryIndex: Map<string, BinaryIndex> = new Map();  // key -> binary location
  
  // Reverse lookup: binary -> key
  private binaryToKey: Map<string, string> = new Map();  // packed binary string -> key

  // Normalized key indices
  private aliasIndex: Map<string, Set<string>> = new Map(); // normalized key -> registry keys
  private domainKeyIndex: Map<string, Set<string>> = new Map(); // domain:key -> registry keys
  
  // Domain mappings
  private domainIdMap: Map<string, number> = new Map();  // domain name -> id
  private domainNameMap: Map<number, string> = new Map();  // id -> domain name
  
  // File mappings per domain
  private fileIdMaps: Map<number, Map<string, number>> = new Map();  // domainId -> (filename -> fileId)
  
  // Statistics
  private stats: SeedRegistryStats = {
    totalEntries: 0,
    totalDomains: 0,
    totalFiles: 0,
    loadedAt: null,
    loadTimeMs: 0,
  };
  
  private constructor() {
    console.log('[SeedRegistry] Initializing...');
  }
  
  public static getInstance(): SeedRegistryManager {
    if (!SeedRegistryManager.instance) {
      SeedRegistryManager.instance = new SeedRegistryManager();
    }
    return SeedRegistryManager.instance;
  }
  
  /**
   * Load all seeds from all domains
   * Called at system initialization
   */
  public async loadAllSeeds(): Promise<void> {
    const startTime = Date.now();
    console.log('[SeedRegistry] Loading all domain seeds...');
    
    // Reset state for clean reloads
    this.entries.clear();
    this.binaryIndex.clear();
    this.binaryToKey.clear();
    this.aliasIndex.clear();
    this.domainKeyIndex.clear();
    this.domainIdMap.clear();
    this.domainNameMap.clear();
    this.fileIdMaps.clear();
    this.stats = {
      totalEntries: 0,
      totalDomains: 0,
      totalFiles: 0,
      loadedAt: null,
      loadTimeMs: 0,
    };
    
    const domainsDir = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains');
    
    try {
      const domainDirs = await fs.readdir(domainsDir, { withFileTypes: true });
      let domainId = 0;
      
      for (const domainDir of domainDirs) {
        if (!domainDir.isDirectory()) continue;
        
        const domainName = domainDir.name;
        const domainPath = path.join(domainsDir, domainName);
        
        // Assign domain ID
        this.domainIdMap.set(domainName, domainId);
        this.domainNameMap.set(domainId, domainName);
        
        // Load seeds for this domain
        await this.loadDomainSeeds(domainName, domainId, domainPath);
        
        domainId++;
      }
      
      // Also load shared vocabulary
      await this.loadSharedVocabulary();
      
      this.stats.totalDomains = domainId;
      this.stats.loadedAt = new Date();
      this.stats.loadTimeMs = Date.now() - startTime;
      
      console.log(`[SeedRegistry] Loaded ${this.stats.totalEntries} entries from ${this.stats.totalDomains} domains in ${this.stats.loadTimeMs}ms`);
      console.log(`[SeedRegistry] Binary index size: ${this.binaryIndex.size} entries`);
      
    } catch (error) {
      console.error('[SeedRegistry] Error loading seeds:', error);
      throw error;
    }
  }
  
  /**
   * Load seeds from a specific domain
   */
  private async loadDomainSeeds(domainName: string, domainId: number, domainPath: string): Promise<void> {
    try {
      // Check for seeds in prefixed subfolder first (e.g., mathematics_seeds/)
      const seedsSubfolder = path.join(domainPath, `${domainName}_seeds`);
      let seedPath = domainPath;
      
      try {
        await fs.access(seedsSubfolder);
        seedPath = seedsSubfolder;
      } catch {
        // Fall back to domain root folder
      }
      
      const files = await fs.readdir(seedPath);
      const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('constants'));
      
      if (jsonFiles.length === 0) return;
      
      // Create file ID mapping for this domain
      const fileIdMap = new Map<string, number>();
      this.fileIdMaps.set(domainId, fileIdMap);
      
      let fileId = 0;
      let domainEntries = 0;
      
      for (const jsonFile of jsonFiles) {
        fileIdMap.set(jsonFile, fileId);
        
        const filePath = path.join(seedPath, jsonFile);
        const rawContent = await fs.readFile(filePath, 'utf-8');
        const content = stripJsonComments(rawContent);

        let data: unknown;
        try {
          data = JSON.parse(content);
        } catch (parseError) {
          console.warn(`[SeedRegistry] Skipping invalid JSON file ${filePath}:`, parseError);
          continue;
        }
        
        // Handle different seed formats
        let entries: unknown[] = [];
        if (isRecordWithArray(data, 'concepts')) {
          entries = data.concepts;
        } else if (isRecordWithArray(data, 'words')) {
          entries = data.words;
        } else if (isRecordWithArray(data, 'terms')) {
          entries = data.terms.map((term) => (typeof term === 'string' ? { term } : term));
        } else if (isRecordWithArray(data, 'vocabulary')) {
          entries = data.vocabulary.map((word) => (typeof word === 'string' ? { word } : word));
        } else if (Array.isArray(data)) {
          entries = data;
        }
        
        // Index each entry
        entries.forEach((entry, entryId) => {
          this.indexEntry(entry, domainName, domainId, fileId, entryId, filePath);
          domainEntries++;
          this.stats.totalEntries++;
        });
        
        fileId++;
        this.stats.totalFiles++;
      }
      
      if (domainEntries > 0) {
        console.log(`[SeedRegistry] ${domainName}: ${domainEntries} entries from ${jsonFiles.length} files`);
      }
      
    } catch (error) {
      // Domain might not have seeds yet - that's ok
      if ((error as { code: string }).code !== 'ENOENT') {
        console.warn(`[SeedRegistry] Error loading ${domainName} seeds:`, error);
      }
    }
  }
  
  /**
   * Load shared vocabulary seeds
   */
  private async loadSharedVocabulary(): Promise<void> {
    const vocabDir = path.join(process.cwd(), 'src', 'ai', 'shared', 'vocabulary');
    const domainName = 'shared_vocabulary';
    const domainId = 255;  // Reserve high ID for shared vocab
    
    this.domainIdMap.set(domainName, domainId);
    this.domainNameMap.set(domainId, domainName);
    
    try {
      await this.loadDomainSeeds(domainName, domainId, vocabDir);
    } catch (error) {
      console.warn('[SeedRegistry] Error loading shared vocabulary:', error);
    }
  }
  
  private extractEntriesFromFile(data: SeedFilePayload): SeedRawEntry[] {
    if (Array.isArray(data)) {
      return data;
    }

    const typed = data as Record<string, unknown>;
    const buckets = ['concepts', 'words', 'terms'];
    const collected: SeedRawEntry[] = [];

    for (const bucket of buckets) {
      const maybe = typed[bucket];
      if (Array.isArray(maybe)) {
        collected.push(...(maybe as SeedRawEntry[]));
      }
    }

    return collected;
  }

  /**
   * Index a single seed entry
   */
  private indexEntry(
    entry: unknown,
    domainName: string,
    domainId: number,
    fileId: number,
    entryId: number,
    filePath: string
  ): void {
    if (!isSeedEntryData(entry)) return;

    // Extract key (word, concept, or term)
    const key = (entry.word || entry.concept || entry.term || entry.name || entry.id || '').toLowerCase();
    
    if (!key) return;  // Skip entries without identifiable key
    
    // Create seed entry
    const seedEntry: SeedEntry = {
      domainId,
      fileId,
      entryId,
      word: entry.word,
      concept: entry.concept,
      term: typeof entry.term === 'string' ? entry.term : typeof entry.name === 'string' ? entry.name : undefined,
      domain: domainName,
      category: entry.category,
      priority:
        typeof entry.priority === 'number'
          ? entry.priority
          : typeof entry.frequency_rank === 'number'
          ? entry.frequency_rank
          : undefined,
      tags: entry.tags || [],
      filePath,
      fullData: entry as Record<string, unknown>
    };

    this.entries.set(registryKey, seedEntry);

    const binary = this.createBinaryIndex(domainId, fileId, entryId);
    const binaryIndex: BinaryIndex = {
      binary,
      key: registryKey,
    };

    this.binaryIndex.set(registryKey, binaryIndex);
    this.binaryToKey.set(this.binaryToString(binary), registryKey);

    for (const normalizedKey of candidateKeys) {
      this.registerDomainKey(domainName, normalizedKey, registryKey);
      this.registerAlias(normalizedKey, registryKey);
    }
  }
  
  /**
   * Create binary index (4 bytes)
   * [domainId(1 byte), fileId(1 byte), entryId(2 bytes)]
   */
  private createBinaryIndex(domainId: number, fileId: number, entryId: number): Uint8Array {
    const buffer = new Uint8Array(4);
    buffer[0] = domainId & 0xFF;
    buffer[1] = fileId & 0xFF;
    buffer[2] = (entryId >> 8) & 0xFF;  // High byte
    buffer[3] = entryId & 0xFF;         // Low byte
    return buffer;
  }
  
  /**
   * Convert binary index to string for Map keys
   */
  private binaryToString(binary: Uint8Array): string {
    return `${binary[0]},${binary[1]},${binary[2]},${binary[3]}`;
  }
  
  /**
   * Parse binary index from string
   */
  private parseBinaryString(binaryString: string): { domainId: number; fileId: number; entryId: number } {
    const parts = binaryString.split(',').map(Number);
    return {
      domainId: parts[0],
      fileId: parts[1],
      entryId: (parts[2] << 8) | parts[3]
    };
  }

  private buildRegistryKey(domainName: string, fileId: number, entryId: number): string {
    return `${domainName}:${fileId}:${entryId}`;
  }

  private buildDomainNormalizedKey(domainName: string, normalizedKey: string): string {
    return `${domainName}:${normalizedKey}`;
  }

  private normalizeKey(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const str = typeof value === 'string'
      ? value
      : typeof value === 'number'
      ? value.toString()
      : null;
    
    if (!str) {
      return null;
    }
    
    const normalized = str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalized || null;
  }

  private collectKeyCandidates(entry: SeedRawEntry): string[] {
    const keys = new Set<string>();

    const addKey = (value: unknown) => {
      if (!value) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(addKey);
        return;
      }
      const normalized = this.normalizeKey(value);
      if (normalized) {
        keys.add(normalized);
      }
    };

    addKey(entry.word);
    addKey(entry.concept);
    addKey(entry.term);
    addKey(entry.name);
    addKey(entry.id);
    addKey(entry.synonyms);
    addKey(entry.relatedConcepts);
    addKey(entry.related);

    return Array.from(keys);
  }

  private collectNormalizedKeys(value: unknown): string[] {
    const normalized = this.normalizeKey(value);
    return normalized ? [normalized] : [];
  }

  private registerDomainKey(domainName: string, normalizedKey: string, registryKey: string): void {
    const domainKey = this.buildDomainNormalizedKey(domainName, normalizedKey);
    if (!this.domainKeyIndex.has(domainKey)) {
      this.domainKeyIndex.set(domainKey, new Set());
    }
    this.domainKeyIndex.get(domainKey)!.add(registryKey);
  }

  private registerAlias(normalizedKey: string, registryKey: string): void {
    if (!this.aliasIndex.has(normalizedKey)) {
      this.aliasIndex.set(normalizedKey, new Set());
    }
    this.aliasIndex.get(normalizedKey)!.add(registryKey);
  }

  private getFirstRegistryKey(keys: Set<string> | undefined, domainFilter?: string): string | null {
    if (!keys) {
      return null;
    }
    for (const registryKey of keys) {
      if (domainFilter && !registryKey.startsWith(`${domainFilter}:`)) {
        continue;
      }
      return registryKey;
    }
    return null;
  }

  private getFirstEntryFromSet(keys: Set<string> | undefined, domainFilter?: string): SeedEntry | null {
    const registryKey = this.getFirstRegistryKey(keys, domainFilter);
    return registryKey ? this.entries.get(registryKey) || null : null;
  }
  
  /**
   * Lookup by key (word/concept/term)
   * Fast O(1) hash lookup
   */
  public lookup(key: string, domain?: string): SeedEntry | null {
    const normalizedKeys = this.collectNormalizedKeys(key);
    if (normalizedKeys.length === 0) {
      return null;
    }

    if (domain) {
      for (const normalized of normalizedKeys) {
        const domainKey = this.buildDomainNormalizedKey(domain, normalized);
        const entry = this.getFirstEntryFromSet(this.domainKeyIndex.get(domainKey));
        if (entry) {
          return entry;
        }
      }
    }

    for (const normalized of normalizedKeys) {
      const entry = this.getFirstEntryFromSet(this.aliasIndex.get(normalized), domain);
      if (entry) {
        return entry;
      }
    }

    return null;
  }
  
  /**
   * Lookup by binary index
   */
  public lookupByBinary(binary: Uint8Array): SeedEntry | null {
    const binaryString = this.binaryToString(binary);
    const key = this.binaryToKey.get(binaryString);
    if (!key) return null;
    return this.entries.get(key) || null;
  }
  
  /**
   * Get binary index for a key
   */
  public getBinaryIndex(key: string, domain?: string): Uint8Array | null {
    const normalizedKeys = this.collectNormalizedKeys(key);
    if (normalizedKeys.length === 0) {
      return null;
    }

    for (const normalized of normalizedKeys) {
      if (domain) {
        const domainKey = this.buildDomainNormalizedKey(domain, normalized);
        const registryKey = this.getFirstRegistryKey(this.domainKeyIndex.get(domainKey));
        if (registryKey) {
          const binaryIndex = this.binaryIndex.get(registryKey);
          if (binaryIndex) {
            return binaryIndex.binary;
          }
        }
      }

      const registryKey = this.getFirstRegistryKey(this.aliasIndex.get(normalized), domain);
      if (registryKey) {
        const binaryIndex = this.binaryIndex.get(registryKey);
        if (binaryIndex) {
          return binaryIndex.binary;
        }
      }
    }

    return null;
  }
  
  /**
   * Get all entries for a domain
   */
  public getDomainEntries(domainName: string): SeedEntry[] {
    const entries: SeedEntry[] = [];
    for (const entry of this.entries.values()) {
      if (entry.domain === domainName) {
        entries.push(entry);
      }
    }
    return entries;
  }
  
  /**
   * Search seeds by tags, category, or text
   */
  public search(query: string, options?: { domain?: string; category?: string; tags?: string[] }): SeedEntry[] {
    const results: SeedEntry[] = [];
    const queryLower = query.toLowerCase();
    
    for (const entry of this.entries.values()) {
      // Filter by domain
      if (options?.domain && entry.domain !== options.domain) continue;
      
      // Filter by category
      if (options?.category && entry.category !== options.category) continue;
      
      // Filter by tags
      if (options?.tags && !options.tags.some(tag => entry.tags?.includes(tag))) continue;
      
      // Text search in key fields
      const matchText = [
        entry.word,
        entry.concept,
        entry.term,
        entry.fullData?.definition,
        entry.fullData?.description,
        entry.fullData?.explanation
      ].join(' ').toLowerCase();
      
      if (matchText.includes(queryLower)) {
        results.push(entry);
      }
    }
    
    return results;
  }
  
  /**
   * Get statistics
   */
  public getStats(): SeedRegistryStats {
    return { ...this.stats };
  }
  
  /**
   * Export binary index to file (for ultra-fast loading)
   */
  public async exportBinaryIndex(outputPath: string): Promise<void> {
    const index = Array.from(this.binaryIndex.entries()).map(([key, binIndex]) => ({
      key,
      binary: Array.from(binIndex.binary)
    }));
    
    await fs.writeFile(outputPath, JSON.stringify(index, null, 2));
    console.log(`[SeedRegistry] Exported binary index to ${outputPath}`);
  }
  
  /**
   * Get complete vocabulary list (all keys)
   */
  public getVocabularyList(): string[] {
    const seen = new Set<string>();
    const vocab: string[] = [];

    for (const entry of this.entries.values()) {
      const uniqueKey = `${entry.domain}:${entry.fileId}:${entry.entryId}`;
      if (seen.has(uniqueKey)) {
        continue;
      }
      seen.add(uniqueKey);

      const label = entry.word || entry.concept || entry.term;
      if (label) {
        vocab.push(label);
      }
    }

    return vocab;
  }
}

function isRecordWithArray<T extends string>(value: unknown, key: T): value is Record<T, unknown[]> {
  return typeof value === 'object' && value !== null && Array.isArray((value as Record<string, unknown[]>)[key]);
}

// Singleton instance
export const seedRegistry = SeedRegistryManager.getInstance();

// Auto-load on import (can be disabled for testing)
if (process.env.NODE_ENV !== 'test') {
  seedRegistry.loadAllSeeds().catch(err => 
    console.error('[SeedRegistry] Auto-load failed:', err)
  );
}

/**
 * Seed entry data interface and type guard
 */
interface SeedEntryData {
  word?: string;
  concept?: string;
  term?: string;
  name?: string;
  id?: string;
  category?: string;
  priority?: number;
  frequency_rank?: number;
  tags?: string[];
}

function isSeedEntryData(data: unknown): data is SeedEntryData {
  return typeof data === 'object' && data !== null;
}
