/**
 * Data Integrity Domain Inference Controller
 * Handles data validation, consistency checks, and data quality queries
 */

import { DOMAIN_NAME } from './data_integrity_constants';

export const dataIntegrityRunInference = async (input: string, _context?: unknown) => {
  const lowerInput = input.toLowerCase();
  
  let responseText = '';
  let confidence = 0.7;
  const sources: string[] = [];
  const sessionNote = context?.sessionId ? `\n\nSession: ${context.sessionId}` : '';

  // Detect data integrity keywords
  if (
    lowerInput.includes('data') ||
    lowerInput.includes('valid') ||
    lowerInput.includes('integrity') ||
    lowerInput.includes('consistency') ||
    lowerInput.includes('quality') ||
    lowerInput.includes('corrupt')
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

What specific data integrity topic would you like to explore?${sessionNote}`;
  } else {
    responseText = `I'm the Data Integrity domain. I specialize in:
- Data validation strategies
- Consistency checking
- Quality assurance
- Error detection in data
- Data cleaning and normalization

How can I help you ensure data integrity?${sessionNote}`;
  }

  return {
    text: responseText,
    confidence,
    sources,
    domain: DOMAIN_NAME,
  };
};

export default dataIntegrityRunInference;
