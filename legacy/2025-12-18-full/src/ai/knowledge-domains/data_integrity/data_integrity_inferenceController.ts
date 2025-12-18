/**
 * File: src/ai/knowledge-domains/data_integrity/data_integrity_inferenceController.ts
 * Purpose: Data Integrity domain inference controller
 * Handles inference for data validation, consistency checks, and quality assurance queries
 */

import { DOMAIN_NAME } from "./data_integrity_constants";

export const dataIntegrityRunInference = async (
  input: string,
  _context?: any,
) => {
  const lowerInput = input.toLowerCase();

  let responseText = "";
  let confidence = 0.7;
  const sources: string[] = [];

  // Detect data integrity keywords
  if (
    lowerInput.includes("data") ||
    lowerInput.includes("valid") ||
    lowerInput.includes("integrity") ||
    lowerInput.includes("consistency") ||
    lowerInput.includes("quality") ||
    lowerInput.includes("corrupt")
  ) {
    confidence = 0.85;

    responseText = `I can help with data integrity and validation. Key concepts:

**Data Validation:**
- Input validation and sanitization
- Schema validation (JSON Schema, Zod, Yup)
- Type checking and constraints
- Format validation (emails, URLs, dates)

**Data Consistency:**
- Database constraints (primary keys, foreign keys)
- Transaction management (ACID properties)
- Data synchronization
- Conflict resolution

**Data Quality:**
- Completeness checks
- Accuracy verification
- Uniqueness constraints
- Timeliness validation

What specific data integrity topic would you like to explore?`;
  } else {
    responseText = `I'm the Data Integrity domain. I specialize in:
- Data validation strategies
- Consistency checking
- Quality assurance
- Error detection in data
- Data cleaning and normalization

How can I help you ensure data integrity?`;
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
