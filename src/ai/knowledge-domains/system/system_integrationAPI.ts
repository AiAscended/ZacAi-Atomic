/**
 * System Domain Integration API
 * 
 * Handles system configuration, deployment, environment setup, dependencies,
 * and core system operations.
 */

import { domainRegistry } from '../domainRegistry';
import fs from 'fs/promises';
import path from 'path';
import { getSystemActiveWeightArtifact, primeSystemWeights } from './system_modelWeightsLoader';

const DOMAIN_NAME = 'system';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type SystemSeedEntry = Record<string, JsonValue>;

interface SystemQueryMetadata {
  totalConcepts: number;
  matchCount: number;
}

interface SystemQueryResult {
  domain: string;
  confidence: number;
  matches: SystemSeedEntry[];
  suggestion: string;
  metadata: SystemQueryMetadata;
}

const isRecord = (value: unknown): value is Record<string, JsonValue> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const normalizeEntry = (entry: unknown): SystemSeedEntry | null => {
  if (isRecord(entry)) {
    return entry;
  }
  return null;
};

/**
 * Load all seed data for system domain
 */
async function loadSeedData(): Promise<SystemSeedEntry[]> {
  try {
    const files = await fs.readdir(DOMAIN_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const allConcepts: SystemSeedEntry[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(DOMAIN_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as unknown;
      
      if (isRecord(data) && Array.isArray(data.concepts)) {
        data.concepts.forEach(concept => {
          const normalized = normalizeEntry(concept);
          if (normalized) {
            allConcepts.push(normalized);
          }
        });
      } else if (Array.isArray(data)) {
        data.forEach(concept => {
          const normalized = normalizeEntry(concept);
          if (normalized) {
            allConcepts.push(normalized);
          }
        });
      } else if (isRecord(data)) {
        allConcepts.push({
          name: file.replace('.json', ''),
          type: 'configuration',
          data: data as JsonValue
        });
      }
    }
    
    console.log(`[System] Loaded ${allConcepts.length} concepts from ${jsonFiles.length} seed files`);
    return allConcepts;
  } catch (error) {
    console.error('[System] Error loading seed data:', error);
    return [];
  }
}

/**
 * Query the system domain with a prompt
 */
async function query(prompt: string): Promise<SystemQueryResult | null> {
  const normalizedPrompt = prompt.toLowerCase();
  
  // Keywords for system operations
  const systemKeywords = [
    'system', 'config', 'configuration', 'setup', 'deploy', 'deployment',
    'environment', 'dependency', 'dependencies', 'infrastructure',
    'server', 'host', 'network', 'resource', 'process',
    'service', 'daemon', 'startup', 'shutdown', 'restart'
  ];
  
  const hasSystemKeyword = systemKeywords.some(keyword => 
    normalizedPrompt.includes(keyword)
  );
  
  if (!hasSystemKeyword) {
    return null;
  }
  
  const seedData = await loadSeedData();
  
  const matches = seedData.filter(concept => {
    const conceptText = JSON.stringify(concept).toLowerCase();
    return systemKeywords.some(keyword => conceptText.includes(keyword));
  });
  
  if (matches.length === 0) {
    return null;
  }
  
  return {
    domain: DOMAIN_NAME,
    confidence: 0.82,
    matches: matches.slice(0, 5),
    suggestion: 'Review system configuration, dependencies, and deployment requirements',
    metadata: {
      totalConcepts: seedData.length,
      matchCount: matches.length
    }
  };
}

/**
 * Initialize the system domain
 */
async function systemInit(): Promise<void> {
  try {
    console.log('[System] Initializing domain...');
    
    const seedData = await loadSeedData();
    
    if (seedData.length === 0) {
      console.warn('[System] No seed data loaded - domain may have limited capabilities');
    }

    const activeWeightFile = await primeSystemWeights();
    if (activeWeightFile) {
      const activeArtifact = await getSystemActiveWeightArtifact();
      if (activeArtifact) {
        console.log(
          `[System] Active weight artifact: ${activeArtifact.file} (type=${activeArtifact.type})`
        );
      } else {
        console.log(`[System] Active weight file resolved: ${activeWeightFile}`);
      }
    } else {
      console.warn('[System] Failed to resolve any system weight artifact - using heuristics only');
    }
    
    console.log('[System] Domain initialized successfully');
  } catch (error) {
    console.error('[System] Initialization error:', error);
    throw error;
  }
}

// Register the domain
domainRegistry.registerDomain({
  name: DOMAIN_NAME,
  displayName: "System",
  description: "System-level operations, configuration, and management",
  atomicLevel: "organ",
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});

// Initialize domain asynchronously
void systemInit();

export { query, loadSeedData, systemInit };
