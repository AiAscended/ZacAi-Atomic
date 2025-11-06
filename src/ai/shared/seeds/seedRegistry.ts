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
  fullData?: any;
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
  
  // Domain mappings
  private domainIdMap: Map<string, number> = new Map();  // domain name -> id
  private domainNameMap: Map<number, string> = new Map();  // id -> domain name
  
  // File mappings per domain
  private fileIdMaps: Map<number, Map<string, number>> = new Map();  // domainId -> (filename -> fileId)
  
  // Statistics
  private stats = {
    totalEntries: 0,
    totalDomains: 0,
    totalFiles: 0,
    loadedAt: null as Date | null,
    loadTimeMs: 0
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
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        // Handle different seed formats
        let entries: any[] = [];
        if (data.concepts && Array.isArray(data.concepts)) {
          entries = data.concepts;
        } else if (data.words && Array.isArray(data.words)) {
          entries = data.words;
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
      if ((error as any).code !== 'ENOENT') {
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
  
  /**
   * Index a single seed entry
   */
  private indexEntry(
    entry: any,
    domainName: string,
    domainId: number,
    fileId: number,
    entryId: number,
    filePath: string
  ): void {
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
      term: entry.term || entry.name,
      domain: domainName,
      category: entry.category,
      priority: entry.priority || entry.frequency_rank,
      tags: entry.tags || [],
      filePath,
      fullData: entry  // Store full data for now (can be lazy-loaded later)
    };
    
    // Store in main registry
    const registryKey = `${domainName}:${key}`;
    this.entries.set(registryKey, seedEntry);
    
    // Create binary index
    const binary = this.createBinaryIndex(domainId, fileId, entryId);
    const binaryIndex: BinaryIndex = {
      binary,
      key: registryKey
    };
    
    this.binaryIndex.set(registryKey, binaryIndex);
    
    // Reverse lookup
    const binaryString = this.binaryToString(binary);
    this.binaryToKey.set(binaryString, registryKey);
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
  
  /**
   * Lookup by key (word/concept/term)
   * Fast O(1) hash lookup
   */
  public lookup(key: string, domain?: string): SeedEntry | null {
    const lookupKey = domain ? `${domain}:${key.toLowerCase()}` : key.toLowerCase();
    
    // Try with domain prefix first
    if (domain) {
      const entry = this.entries.get(lookupKey);
      if (entry) return entry;
    }
    
    // Search across all domains
    for (const [entryKey, entry] of this.entries.entries()) {
      if (entryKey.endsWith(`:${key.toLowerCase()}`)) {
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
    const lookupKey = domain ? `${domain}:${key.toLowerCase()}` : key.toLowerCase();
    const binaryIndex = this.binaryIndex.get(lookupKey);
    return binaryIndex?.binary || null;
  }
  
  /**
   * Get all entries for a domain
   */
  public getDomainEntries(domainName: string): SeedEntry[] {
    const entries: SeedEntry[] = [];
    for (const [key, entry] of this.entries.entries()) {
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
  public getStats() {
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
    return Array.from(this.entries.keys()).map(key => key.split(':')[1]);
  }
}

// Singleton instance
export const seedRegistry = SeedRegistryManager.getInstance();

// Auto-load on import (can be disabled for testing)
if (process.env.NODE_ENV !== 'test') {
  seedRegistry.loadAllSeeds().catch(err => 
    console.error('[SeedRegistry] Auto-load failed:', err)
  );
}
