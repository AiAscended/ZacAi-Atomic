/**
 * Repair Domain Inference Controller
 * Handles error detection, debugging, and code repair queries
 */

import { DOMAIN_NAME } from './repair_constants';

type RepairGuidanceType = 'general' | 'debugging' | 'follow_up';

interface RepairInferenceMetadata {
  matchedKeywords: string[];
  requiresUserContext: boolean;
  guidanceType: RepairGuidanceType;
  generatedAt: string;
}

export interface RepairInferenceResponse {
  text: string;
  confidence: number;
  sources: string[];
  domain: string;
  metadata: RepairInferenceMetadata;
}

const REPAIR_KEYWORDS = [
  'error',
  'bug',
  'fix',
  'debug',
  'repair',
  'broken',
  'not working',
  'stack trace',
];

const findMatchedKeywords = (input: string): string[] => {
  const lowerInput = input.toLowerCase();
  return REPAIR_KEYWORDS.filter((keyword) => lowerInput.includes(keyword));
};

const buildDebugResponse = (): string => `I can help you debug and fix issues. To provide the best assistance, please share:

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

const buildGeneralResponse = (): string => `I'm the Repair & Debugging domain. I can help with:
- Error detection and analysis
- Code debugging strategies
- Bug fixes and troubleshooting
- Self-healing operations
- Error prevention patterns

What issue would you like help with?`;

export const repairRunInference = async (input: string): Promise<RepairInferenceResponse> => {
  const lowerInput = input.toLowerCase();
  const matchedKeywords = findMatchedKeywords(lowerInput);
  const hasRepairContext = matchedKeywords.length > 0;
  
  let responseText = '';
  const confidence = hasRepairContext ? 0.85 : 0.7;
  const sources: string[] = hasRepairContext
    ? ['Repair Domain Guidance', 'Debugging Playbook']
    : ['Repair Domain Overview'];
  const requiresUserContext = hasRepairContext;
  const guidanceType: RepairGuidanceType = hasRepairContext ? 'debugging' : 'general';

  // Detect repair/debugging keywords
  responseText = hasRepairContext ? buildDebugResponse() : buildGeneralResponse();

  return {
    text: responseText,
    confidence,
    sources,
    domain: DOMAIN_NAME,
    metadata: {
      matchedKeywords,
      requiresUserContext,
      guidanceType,
      generatedAt: new Date().toISOString(),
    },
  };
};

export default repairRunInference;
