/**
 * File: src/ai/knowledge-domains/data_integrity/data_integrity_inferenceController.ts
 * Purpose: Data Integrity domain inference controller
 * Handles inference for data validation, consistency checks, and quality assurance queries
 */

import fs from 'fs/promises';
import path from 'path';

const DOMAIN_NAME = 'data_integrity';
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
    console.error('[DataIntegrity] Error loading seed data:', error);
    return [];
  }
}

/**
 * Run inference for data integrity queries
 */
export const dataIntegrityRunInference = async (input: string): Promise<any> => {
  const normalizedInput = input.toLowerCase();
  
  // Keywords that indicate data integrity concerns
  const integrityKeywords = [
    'validate', 'validation', 'verify', 'check', 'integrity', 'quality',
    'consistency', 'accuracy', 'completeness', 'constraint', 'error',
    'duplicate', 'missing', 'corrupt', 'anomaly', 'outlier'
  ];
  
  const hasIntegrityKeyword = integrityKeywords.some(keyword => 
    normalizedInput.includes(keyword)
  );
  
  if (!hasIntegrityKeyword) {
    return null;
  }
  
  try {
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
      response: `Data integrity analysis: Found ${matches.length} relevant validation concepts. Consider implementing data validation rules, consistency checks, and quality metrics to ensure data reliability.`,
      confidence: 0.8,
      topics: ['data validation', 'data quality', 'integrity checks'],
      metadata: {
        domain: DOMAIN_NAME,
        totalConcepts: seedData.length,
        matchCount: matches.length,
        matches: matches.slice(0, 5)
      }
    };
  } catch (error) {
    console.error('[DataIntegrity] Inference error:', error);
    return null;
  }
};

export default dataIntegrityRunInference;
