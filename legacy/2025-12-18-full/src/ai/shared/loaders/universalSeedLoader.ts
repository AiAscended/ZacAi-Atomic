/**
 * File: src/ai/shared/loaders/universalSeedLoader.ts
 * Purpose: Universal seed data loader for all knowledge domains
 * Loads vocabulary, concepts, embeddings, and URL sources
 */

import * as fs from 'fs';
import * as path from 'path';

export type SeedConcept = Record<string, unknown>;

export interface SeedData {
  vocabulary: string[];
  concepts: SeedConcept[];
  urlSources: URLSource[];
  metadata: {
    domain: string;
    version: string;
    lastUpdated: string;
    totalSeeds: number;
  };
}

export interface URLSource {
  name: string;
  url: string;
  type: string;
  priority: number;
  sections?: string[];
  topics?: string[];
}

export interface ConceptSeed {
  id: string;
  concept: string;
  description: string;
  examples?: string[];
  relatedConcepts?: string[];
  difficulty?: string;
  tags?: string[];
}

/**
 * Load all seed data for a specific domain
 */
export async function loadDomainSeeds(domainName: string): Promise<SeedData> {
  const seedsPath = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', domainName, `${domainName}_seeds`);
  
  console.log(`[SeedLoader] Loading seeds for ${domainName} from ${seedsPath}`);

  const seedData: SeedData = {
    vocabulary: [],
    concepts: [],
    urlSources: [],
    metadata: {
      domain: domainName,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalSeeds: 0
    }
  };

  try {
    // Load vocabulary
    const vocabFiles = [
      `${domainName}_seedVocabulary.json`,
      `${domainName}_vocabulary1.json`,
      `${domainName}Vocabulary.json`
    ];

    for (const vocabFile of vocabFiles) {
      const vocabPath = path.join(seedsPath, vocabFile);
      if (fs.existsSync(vocabPath)) {
        const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
        if (vocabData.vocabulary && Array.isArray(vocabData.vocabulary)) {
          seedData.vocabulary.push(...vocabData.vocabulary);
          console.log(`[SeedLoader] Loaded ${vocabData.vocabulary.length} vocabulary terms from ${vocabFile}`);
        }
      }
    }

    // Load URL sources
    const urlLookupPath = path.join(seedsPath, `${domainName}_urlLookup.json`);
    if (fs.existsSync(urlLookupPath)) {
      const urlData = JSON.parse(fs.readFileSync(urlLookupPath, 'utf-8'));
      
      if (urlData.officialSources) {
        seedData.urlSources.push(...urlData.officialSources);
      }
      if (urlData.communityResources) {
        seedData.urlSources.push(...urlData.communityResources);
      }
      if (urlData.apiReferences) {
        seedData.urlSources.push(...urlData.apiReferences);
      }
      
      console.log(`[SeedLoader] Loaded ${seedData.urlSources.length} URL sources for ${domainName}`);
    }

    // Load concept seeds from all seed files
    const files = fs.readdirSync(seedsPath);
    const seedFiles = files.filter(f => 
      f.endsWith('.json') && 
      !f.includes('Vocabulary') && 
      !f.includes('urlLookup') &&
      !f.includes('webDoc') &&
      !f.includes('meta') &&
      !f.includes('learned')
    );

    for (const seedFile of seedFiles) {
      try {
        const filePath = path.join(seedsPath, seedFile);
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;
        const seeds = extractSeedArray(fileData);
        if (seeds) {
          seedData.concepts.push(...seeds);
        }
      } catch (error) {
        console.warn(`[SeedLoader] Failed to load ${seedFile}:`, error);
      }
    }

    seedData.metadata.totalSeeds = seedData.vocabulary.length + seedData.concepts.length;
    
    console.log(`[SeedLoader] ✓ Loaded ${domainName}: ${seedData.vocabulary.length} vocab terms, ${seedData.concepts.length} concepts, ${seedData.urlSources.length} URL sources`);
    
    return seedData;
  } catch (error) {
    console.error(`[SeedLoader] Error loading seeds for ${domainName}:`, error);
    return seedData;
  }
}

/**
 * Load pretrained weights for a domain
 */
export async function loadDomainWeights(domainName: string): Promise<Record<string, unknown> | null> {
  const weightsPath = path.join(
    process.cwd(), 
    'src', 
    'ai', 
    'knowledge-domains', 
    domainName, 
    `${domainName}_weights`,
    `${domainName}_pretrainedWeights.json`
  );

  try {
    if (fs.existsSync(weightsPath)) {
      const weights = JSON.parse(fs.readFileSync(weightsPath, 'utf-8')) as Record<string, unknown>;
      console.log(`[SeedLoader] Loaded pretrained weights for ${domainName}`);
      return weights;
    } else {
      console.warn(`[SeedLoader] No pretrained weights found at ${weightsPath}`);
      return null;
    }
  } catch (error) {
    console.error(`[SeedLoader] Error loading weights for ${domainName}:`, error);
    return null;
  }
}

/**
 * Get URL sources for web scraping
 */
export function getURLSources(seedData: SeedData, topic?: string): URLSource[] {
  if (!topic) {
    return seedData.urlSources.sort((a, b) => a.priority - b.priority);
  }

  // Filter by topic
  return seedData.urlSources
    .filter(source => {
      if (source.topics && source.topics.some(t => t.toLowerCase().includes(topic.toLowerCase()))) {
        return true;
      }
      if (source.sections && source.sections.some(s => s.toLowerCase().includes(topic.toLowerCase()))) {
        return true;
      }
      return false;
    })
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Search concepts by query
 */
export function searchConcepts(seedData: SeedData, query: string): SeedConcept[] {
  const lowerQuery = query.toLowerCase();
  const tokens = lowerQuery.split(/\s+/);

  return seedData.concepts.filter(concept => {
    const conceptStr = JSON.stringify(concept).toLowerCase();
    return tokens.some(token => conceptStr.includes(token));
  });
}

/**
 * Get vocabulary index for tokenization
 */
export function buildVocabularyIndex(vocabulary: string[]): Map<string, number> {
  const index = new Map<string, number>();
  vocabulary.forEach((word, idx) => {
    index.set(word.toLowerCase(), idx);
  });
  return index;
}

type SeedContainer = {
  seeds?: unknown;
  concepts?: unknown;
  components?: unknown;
};

function isSeedArray(value: unknown): value is SeedConcept[] {
  return Array.isArray(value);
}

function extractSeedArray(value: unknown): SeedConcept[] | null {
  if (isSeedArray(value)) {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    const container = value as SeedContainer;
    if (isSeedArray(container.seeds)) {
      return container.seeds;
    }
    if (isSeedArray(container.concepts)) {
      return container.concepts;
    }
    if (isSeedArray(container.components)) {
      return container.components;
    }
  }

  return null;
}

const universalSeedLoader = {
  loadDomainSeeds,
  loadDomainWeights,
  getURLSources,
  searchConcepts,
  buildVocabularyIndex
};

export default universalSeedLoader;
