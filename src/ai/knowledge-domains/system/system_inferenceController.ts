/**
 * File: src/ai/knowledge-domains/system/system_inferenceController.ts
 * Purpose: System domain inference controller
 * Handles inference for system configuration, deployment, and environment queries
 */

import fs from 'fs/promises';
import path from 'path';

const DOMAIN_NAME = 'system';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

/**
 * Load seed data for inference
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
      } else if (typeof data === 'object') {
        allConcepts.push({
          name: file.replace('.json', ''),
          type: 'configuration',
          data: data
        });
      }
    }
    
    return allConcepts;
  } catch (error) {
    console.error('[System] Error loading seed data:', error);
    return [];
  }
}

/**
 * Run inference for system queries
 */
export const systemRunInference = async (input: string): Promise<any> => {
  const normalizedInput = input.toLowerCase();
  
  // Keywords for system operations
  const systemKeywords = [
    'system', 'config', 'configuration', 'setup', 'deploy', 'deployment',
    'environment', 'dependency', 'dependencies', 'infrastructure',
    'server', 'host', 'network', 'resource', 'process',
    'service', 'daemon', 'startup', 'shutdown', 'restart'
  ];
  
  const hasSystemKeyword = systemKeywords.some(keyword => 
    normalizedInput.includes(keyword)
  );
  
  if (!hasSystemKeyword) {
    return null;
  }
  
  try {
    const seedData = await loadSeedData();
    
    const matches = seedData.filter(concept => {
      const conceptText = JSON.stringify(concept).toLowerCase();
      return systemKeywords.some(keyword => conceptText.includes(keyword));
    });
    
    if (matches.length === 0) {
      return null;
    }
    
    return {
      response: `System operations analysis: Found ${matches.length} relevant system concepts. Review system configuration, dependencies, deployment requirements, and infrastructure settings to ensure proper operation.`,
      confidence: 0.82,
      topics: ['system configuration', 'deployment', 'infrastructure'],
      metadata: {
        domain: DOMAIN_NAME,
        totalConcepts: seedData.length,
        matchCount: matches.length,
        matches: matches.slice(0, 5)
      }
    };
  } catch (error) {
    console.error('[System] Inference error:', error);
    return null;
  }
};

export default systemRunInference;
