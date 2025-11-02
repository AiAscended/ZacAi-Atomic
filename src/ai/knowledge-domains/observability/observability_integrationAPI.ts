/**
 * Observability Domain Integration API
 * 
 * Handles monitoring, logging, tracing, metrics, and alerting for system observability.
 * Provides insights into system behavior and performance.
 */

import { registerDomain } from '../domainRegistry';
import fs from 'fs/promises';
import path from 'path';

const DOMAIN_NAME = 'observability';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

/**
 * Load all seed data for observability domain
 */
async function loadSeedData(): Promise<any[]> {
  try {
    const files = await fs.readdir(DOMAIN_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const allConcepts: any[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(DOMAIN_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.concepts && Array.isArray(data.concepts)) {
        allConcepts.push(...data.concepts);
      } else if (Array.isArray(data)) {
        allConcepts.push(...data);
      }
    }
    
    console.log(`[Observability] Loaded ${allConcepts.length} concepts from ${jsonFiles.length} seed files`);
    return allConcepts;
  } catch (error) {
    console.error('[Observability] Error loading seed data:', error);
    return [];
  }
}

/**
 * Query the observability domain with a prompt
 */
async function query(prompt: string): Promise<any> {
  const normalizedPrompt = prompt.toLowerCase();
  
  // Keywords for observability
  const observabilityKeywords = [
    'monitor', 'monitoring', 'log', 'logging', 'trace', 'tracing',
    'metric', 'metrics', 'alert', 'alerting', 'telemetry',
    'performance', 'latency', 'throughput', 'error rate',
    'dashboard', 'observe', 'visibility', 'instrumentation'
  ];
  
  const hasObservabilityKeyword = observabilityKeywords.some(keyword => 
    normalizedPrompt.includes(keyword)
  );
  
  if (!hasObservabilityKeyword) {
    return null;
  }
  
  const seedData = await loadSeedData();
  
  const matches = seedData.filter(concept => {
    const conceptText = JSON.stringify(concept).toLowerCase();
    return observabilityKeywords.some(keyword => conceptText.includes(keyword));
  });
  
  if (matches.length === 0) {
    return null;
  }
  
  return {
    domain: DOMAIN_NAME,
    confidence: 0.85,
    matches: matches.slice(0, 5),
    suggestion: 'Consider implementing monitoring, logging, and alerting for better system visibility',
    metadata: {
      totalConcepts: seedData.length,
      matchCount: matches.length
    }
  };
}

/**
 * Initialize the observability domain
 */
async function observabilityInit(): Promise<void> {
  try {
    console.log('[Observability] Initializing domain...');
    
    const seedData = await loadSeedData();
    
    if (seedData.length === 0) {
      console.warn('[Observability] No seed data loaded - domain may have limited capabilities');
    }
    
    console.log('[Observability] Domain initialized successfully');
  } catch (error) {
    console.error('[Observability] Initialization error:', error);
    throw error;
  }
}

// Register the domain
registerDomain({
  name: DOMAIN_NAME,
  displayName: 'Observability',
  description: 'System monitoring, logging, tracing, metrics, and alerting',
  query,
  tags: ['monitoring', 'logging', 'metrics', 'tracing', 'alerting', 'performance'],
  category: 'operations',
  priority: 7,
  capabilities: [
    'performance monitoring',
    'error tracking',
    'distributed tracing',
    'metrics collection',
    'log aggregation',
    'alerting',
    'dashboard creation'
  ]
});

// Initialize domain asynchronously
void observabilityInit();

export { query, loadSeedData, observabilityInit };
