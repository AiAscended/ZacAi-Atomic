/**
 * Repair Domain Inference Controller
 * Handles error detection, debugging, and code repair queries
 */

import { DOMAIN_NAME } from './repair_constants';

export const repairRunInference = async (input: string, _context?: unknown) => {
  const lowerInput = input.toLowerCase();
  
  let responseText = '';
  let confidence = 0.7;
  const sources: string[] = [];

  // Detect repair/debugging keywords
  if (
    lowerInput.includes('error') ||
    lowerInput.includes('bug') ||
    lowerInput.includes('fix') ||
    lowerInput.includes('debug') ||
    lowerInput.includes('repair') ||
    lowerInput.includes('broken') ||
    lowerInput.includes('not working')
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

  return {
    text: responseText,
    confidence,
    sources,
    domain: DOMAIN_NAME,
  };
};

export default repairRunInference;
