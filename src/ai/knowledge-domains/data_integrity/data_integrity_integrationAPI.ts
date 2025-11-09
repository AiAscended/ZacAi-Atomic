/**
 * Data Integrity Domain Integration API
 * 
 * Handles data validation, consistency checks, quality assurance, and error detection.
 * Ensures data reliability and integrity across the system.
 */

import { domainRegistry } from '../domainRegistry';
import fs from 'fs/promises';
import path from 'path';

const DOMAIN_NAME = 'data_integrity';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);
const SEEDS_DIR = path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`);

/**
 * Load all seed data for data integrity domain
 */
async function loadSeedData(): Promise<any[]> {
  try {
    const files = await fs.readdir(SEEDS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const allConcepts: unknown[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(SEEDS_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Handle both {concepts: [...]} and direct array formats
      if (data.concepts && Array.isArray(data.concepts)) {
        allConcepts.push(...data.concepts);
      } else if (Array.isArray(data)) {
        allConcepts.push(...data);
      }
    }
    
    console.log(`[DataIntegrity] Loaded ${allConcepts.length} concepts from ${jsonFiles.length} seed files`);
    return allConcepts;
  } catch (error) {
    console.error('[DataIntegrity] Error loading seed data:', error);
    return [];
  }
}

/**
 * Query the data integrity domain with a prompt
 */
async function query(prompt: string): Promise<any> {
  const normalizedPrompt = prompt.toLowerCase();
  
  // Keywords that indicate data integrity concerns
  const integrityKeywords = [
    'validate', 'validation', 'verify', 'check', 'integrity', 'quality',
    'consistency', 'accuracy', 'completeness', 'constraint', 'error',
    'duplicate', 'missing', 'corrupt', 'anomaly', 'outlier'
  ];
  
  const hasIntegrityKeyword = integrityKeywords.some(keyword => 
    normalizedPrompt.includes(keyword)
  );
  
  if (!hasIntegrityKeyword) {
    return null;
  }
  
  const seedData = await loadSeedData();
  
  // Find matching concepts
  const matches = seedData.filter(concept => {
    const conceptText = JSON.stringify(concept).toLowerCase();
    return integrityKeywords.some(keyword => conceptText.includes(keyword));
  });
  
  if (matches.length === 0) {
    return null;
  }
  
  return {
    domain: DOMAIN_NAME,
    confidence: 0.8,
    matches: matches.slice(0, 5), // Return top 5 matches
    suggestion: 'Consider data validation rules, consistency checks, and quality metrics',
    metadata: {
      totalConcepts: seedData.length,
      matchCount: matches.length
    }
  };
}

/**
 * Initialize and register the data integrity domain
 */
export const dataIntegrityInit = async () => {
  try {
    console.log('[DataIntegrity] Initializing domain...');
    
    // Pre-load seed data to verify it's available
    const seedData = await loadSeedData();
    
    if (seedData.length === 0) {
      console.warn('[DataIntegrity] No seed data loaded - domain may have limited capabilities');
    }
    
    console.log('[DataIntegrity] Domain initialized successfully');
  } catch (error) {
    console.error('[DataIntegrity] Initialization error:', error);
  }

  // Register domain files for tracking;

  // Register the domain with the registry
  domainRegistry.registerDomain({
  name: DOMAIN_NAME,
  displayName: 'Data Integrity',
  description: 'Data Integrity domain capabilities',
  atomicLevel: 'molecule',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});
};

// Auto-initialize when imported
void dataIntegrityInit();

export default dataIntegrityInit;
