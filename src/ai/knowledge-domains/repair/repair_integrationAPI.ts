/**
 * Repair Domain Integration API
 * 
 * Handles error fixing, code repair, debugging strategies, and self-healing operations.
 * Provides automated and semi-automated repair capabilities.
 */

import { domainRegistry } from '../domainRegistry';
import fs from 'fs/promises';
import path from 'path';

const DOMAIN_NAME = 'repair';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);
const SEEDS_DIR = path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`);

/**
 * Load all seed data for repair domain
 */
async function loadSeedData(): Promise<any[]> {
  try {
    const files = await fs.readdir(SEEDS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const allConcepts: any[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(SEEDS_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.concepts && Array.isArray(data.concepts)) {
        allConcepts.push(...data.concepts);
      } else if (Array.isArray(data)) {
        allConcepts.push(...data);
      }
    }
    
    console.log(`[Repair] Loaded ${allConcepts.length} concepts from ${jsonFiles.length} seed files`);
    return allConcepts;
  } catch (error) {
    console.error('[Repair] Error loading seed data:', error);
    return [];
  }
}

/**
 * Query the repair domain with a prompt
 */
async function query(prompt: string): Promise<any> {
  const normalizedPrompt = prompt.toLowerCase();
  
  // Keywords for repair and debugging
  const repairKeywords = [
    'fix', 'repair', 'debug', 'debugging', 'error', 'bug',
    'broken', 'issue', 'problem', 'solve', 'troubleshoot',
    'crash', 'failure', 'exception', 'self-heal', 'recover',
    'restore', 'correct', 'patch'
  ];
  
  const hasRepairKeyword = repairKeywords.some(keyword => 
    normalizedPrompt.includes(keyword)
  );
  
  if (!hasRepairKeyword) {
    return null;
  }
  
  const seedData = await loadSeedData();
  
  const matches = seedData.filter(concept => {
    const conceptText = JSON.stringify(concept).toLowerCase();
    return repairKeywords.some(keyword => conceptText.includes(keyword));
  });
  
  if (matches.length === 0) {
    return null;
  }
  
  return {
    domain: DOMAIN_NAME,
    confidence: 0.88,
    matches: matches.slice(0, 5),
    suggestion: 'Analyze error patterns, apply debugging strategies, and implement repair solutions',
    metadata: {
      totalConcepts: seedData.length,
      matchCount: matches.length
    }
  };
}

/**
 * Initialize and register the repair domain
 */
export const repairInit = async () => {
  try {
    console.log('[Repair] Initializing domain...');
    
    const seedData = await loadSeedData();
    
    if (seedData.length === 0) {
      console.warn('[Repair] No seed data loaded - domain may have limited capabilities');
    }
    
    console.log('[Repair] Domain initialized successfully');
  } catch (error) {
    console.error('[Repair] Initialization error:', error);
  }

  // Register domain files for tracking;

};

// Register the domain with the unified registry
domainRegistry.registerDomain({
  name: DOMAIN_NAME,
  displayName: 'Repair & Debugging',
  description: 'Error fixing, code repair, debugging strategies, and self-healing operations',
  atomicLevel: 'molecule',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});

// Auto-initialize when imported
void repairInit();

export default repairInit;
export { query, loadSeedData };
