/**
 * File: src/ai/knowledge-domains/observability/observability_inferenceController.ts
 * Purpose: Observability domain inference controller
 * Handles inference for monitoring, logging, tracing, and metrics queries
 */

import fs from 'fs/promises';
import path from 'path';

const DOMAIN_NAME = 'observability';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);
const SEEDS_DIR = path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`);

/**
 * Load seed data for inference
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
    
    return allConcepts;
  } catch (error) {
    console.error('[Observability] Error loading seed data:', error);
    return [];
  }
}

/**
 * Run inference for observability queries
 */
export const observabilityRunInference = async (input: string): Promise<any> => {
  const normalizedInput = input.toLowerCase();
  
  // Keywords for observability
  const observabilityKeywords = [
    'monitor', 'monitoring', 'log', 'logging', 'trace', 'tracing',
    'metric', 'metrics', 'alert', 'alerting', 'telemetry',
    'performance', 'latency', 'throughput', 'error rate',
    'dashboard', 'observe', 'visibility', 'instrumentation'
  ];
  
  const hasObservabilityKeyword = observabilityKeywords.some(keyword => 
    normalizedInput.includes(keyword)
  );
  
  if (!hasObservabilityKeyword) {
    return null;
  }
  
  try {
    const seedData = await loadSeedData();
    
    const matches = seedData.filter(concept => {
      const conceptText = JSON.stringify(concept).toLowerCase();
      return observabilityKeywords.some(keyword => conceptText.includes(keyword));
    });
    
    if (matches.length === 0) {
      return null;
    }
    
    return {
      response: `Observability insights: Found ${matches.length} relevant monitoring concepts. Consider implementing comprehensive monitoring, logging, and alerting for better system visibility and operational awareness.`,
      confidence: 0.85,
      topics: ['monitoring', 'logging', 'metrics', 'alerting'],
      metadata: {
        domain: DOMAIN_NAME,
        totalConcepts: seedData.length,
        matchCount: matches.length,
        matches: matches.slice(0, 5)
      }
    };
  } catch (error) {
    console.error('[Observability] Inference error:', error);
    return null;
  }
};

export default observabilityRunInference;
