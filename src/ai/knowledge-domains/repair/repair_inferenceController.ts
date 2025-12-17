/**
 * File: src/ai/knowledge-domains/repair/repair_inferenceController.ts
 * Purpose: Repair domain inference controller
 * Handles inference for error fixing, debugging, and code repair queries
 */

import { DOMAIN_NAME } from "./repair_constants";

export const repairRunInference = async (input: string, _context?: any) => {
  const lowerInput = input.toLowerCase();

  let responseText = "";
  let confidence = 0.7;
  const sources: string[] = [];

  // Detect repair/debugging keywords
  if (
    lowerInput.includes("error") ||
    lowerInput.includes("bug") ||
    lowerInput.includes("fix") ||
    lowerInput.includes("debug") ||
    lowerInput.includes("repair") ||
    lowerInput.includes("broken") ||
    lowerInput.includes("not working")
  ) {
    confidence = 0.85;

    responseText = `I can help you debug and fix issues. To provide the best assistance, please share:

1. **Error Message**: What error are you seeing?
2. **Code Context**: The relevant code that's causing the issue
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What's actually happening?

Common debugging approaches:
- Check error stack traces for the root cause
- Verify variable types and values
- Look for null/undefined references
- Check for async/await issues
- Validate input data

Feel free to share the specific error and I'll help you resolve it!`;
  } else {
    responseText = `I'm the Repair & Debugging domain. I can help with:
- Error detection and analysis
- Code debugging strategies
- Bug fixes and troubleshooting
- Self-healing operations
- Error prevention patterns

What issue would you like help with?`;
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
