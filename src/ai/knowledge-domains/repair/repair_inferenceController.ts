/**
 * File: src/ai/knowledge-domains/repair/repair_inferenceController.ts
 * Purpose: Repair domain inference controller
 * Handles inference for error fixing, debugging, and code repair queries
 */

import fs from 'fs/promises';
import path from 'path';

const DOMAIN_NAME = 'repair';
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
    console.error('[Repair] Error loading seed data:', error);
    return [];
  }
}

/**
 * Run inference for repair and debugging queries
 */
export const repairRunInference = async (input: string): Promise<any> => {
  const normalizedInput = input.toLowerCase();
  
  // Keywords for repair and debugging
  const repairKeywords = [
    'fix', 'repair', 'debug', 'debugging', 'error', 'bug',
    'broken', 'issue', 'problem', 'solve', 'troubleshoot',
    'crash', 'failure', 'exception', 'self-heal', 'recover',
    'restore', 'correct', 'patch'
  ];
  
  const hasRepairKeyword = repairKeywords.some(keyword => 
    normalizedInput.includes(keyword)
  );
  
  if (!hasRepairKeyword) {
    return null;
  }
  
  try {
    const seedData = await loadSeedData();
    
    const matches = seedData.filter(concept => {
      const conceptText = JSON.stringify(concept).toLowerCase();
      return repairKeywords.some(keyword => conceptText.includes(keyword));
    });
    
    if (matches.length === 0) {
      return null;
    }
    
    return {
      response: `Repair and debugging analysis: Found ${matches.length} relevant debugging strategies. Analyze error patterns, apply systematic debugging approaches, and implement targeted repair solutions to resolve the issue.`,
      confidence: 0.88,
      topics: ['debugging', 'error fixing', 'troubleshooting', 'repair'],
      metadata: {
        domain: DOMAIN_NAME,
        totalConcepts: seedData.length,
        matchCount: matches.length,
        matches: matches.slice(0, 5)
      }
    };
  } catch (error) {
    console.error('[Repair] Inference error:', error);
    return null;
  }
};

export default repairRunInference;
