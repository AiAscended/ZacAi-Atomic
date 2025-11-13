/**
 * File: src/ai/shared/memory/LearningIntegration.ts
 * Description: Integration utilities that connect the Learning Memory System
 * with URL lookup tools, knowledge retrieval, and domain-specific learning.
 */

import { learningMemory, LearnedItem } from './LearningMemorySystem';
import { lookupSeed, searchSeeds } from '../seeds/seedLookup';

// ============================================================================
// URL Lookup Integration
// ============================================================================

/**
 * Lookup a term using URL tools and learn if new
 */
export async function lookupAndLearn(
  sessionId: string,
  domain: string,
  term: string,
  context: string
): Promise<{
  found: boolean;
  fromExisting: boolean;
  data: LearnedItem | unknown;
  source: 'seed' | 'learned' | 'url-lookup';
}> {
  // 1. Check if already in seed vocabulary
  const seedData = lookupSeed(term, domain);
  if (seedData) {
    return {
      found: true,
      fromExisting: true,
      data: seedData,
      source: 'seed',
    };
  }

  // 2. Check if already learned
  const learnedData = learningMemory.retrieveLearnedItem(domain, term);
  if (learnedData) {
    return {
      found: true,
      fromExisting: true,
      data: learnedData,
      source: 'learned',
    };
  }

  // 3. Perform URL lookup (simulated - you'd integrate with actual URL lookup)
  const urlLookupResult = await performURLLookup(domain, term);

  if (urlLookupResult.found && isUrlLookupData(urlLookupResult.data)) {
    // Learn the new term
    const learned = learningMemory.learnItem(
      sessionId,
      domain,
      determineCategory(term, urlLookupResult.data),
      term,
      urlLookupResult.data.definition,
      urlLookupResult.data.source,
      context,
      {
        examples: urlLookupResult.data.examples,
        relatedTerms: urlLookupResult.data.related,
        confidence: 0.8,
        verified: true,
        learnedFrom: 'url-lookup',
      }
    );

    return {
      found: true,
      fromExisting: false,
      data: learned,
      source: 'url-lookup',
    };
  }

  return {
    found: false,
    fromExisting: false,
    data: null,
    source: 'url-lookup',
  };
}

/**
 * Simulated URL lookup (replace with actual implementation)
 */
async function performURLLookup(
  domain: string,
  term: string
): Promise<{ found: boolean; data?: unknown }> {
  // This would integrate with your actual URL lookup tools
  // For now, return a simulated response
  
  console.log(`🔍 URL lookup: ${term} in ${domain}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return simulated data (replace with actual API call)
  return {
    found: false,
    data: null,
  };
}

/**
 * Determine category based on term and data
 */
function determineCategory(term: string, data: unknown): LearnedItem['category'] {
  if (term.match(/[+\-*/=]/)) return 'equation';
  if (isUrlLookupData(data)) {
    if (data.type === 'concept') return 'concept';
    if (data.type === 'fact') return 'fact';
    if (data.type === 'procedure') return 'procedure';
  }
  return 'vocabulary';
}

// ============================================================================
// Context-Aware Learning
// ============================================================================

/**
 * Extract and learn new terms from user input
 */
export async function extractAndLearnFromInput(
  sessionId: string,
  userInput: string,
  detectedDomains: string[]
): Promise<LearnedItem[]> {
  const learned: LearnedItem[] = [];

  // Extract potential new terms (simple heuristic - can be improved)
  const potentialTerms = extractPotentialTerms(userInput);

  for (const term of potentialTerms) {
    for (const domain of detectedDomains) {
      // Check if unknown
      if (!learningMemory.isKnown(domain, term)) {
        // Try to look up and learn
        const result = await lookupAndLearn(
          sessionId,
          domain,
          term,
          `Extracted from user input: "${userInput}"`
        );

        if (result.found && !result.fromExisting) {
          learned.push(result.data as LearnedItem);
        }
      }
    }
  }

  return learned;
}

/**
 * Extract potential technical terms from text
 */
function extractPotentialTerms(text: string): string[] {
  // Simple extraction - can be enhanced with NLP
  const words = text.split(/\s+/);
  const terms: string[] = [];

  words.forEach(word => {
    // Remove punctuation
    const cleaned = word.replace(/[^\w\s-]/g, '');
    
    // Keep technical-looking terms (capitalized, hyphenated, or mixed case)
    if (
      cleaned.length > 3 &&
      (cleaned[0] === cleaned[0].toUpperCase() ||
       cleaned.includes('-') ||
       cleaned.match(/[a-z][A-Z]/))
    ) {
      terms.push(cleaned);
    }
  });

  return [...new Set(terms)]; // Remove duplicates
}

// ============================================================================
// Session Context Enhancement
// ============================================================================

/**
 * Enhance prompt with session context and learned vocabulary
 */
export function enhancePromptWithContext(
  sessionId: string,
  prompt: string,
  domains: string[]
): {
  enhancedPrompt: string;
  contextAdded: string[];
} {
  const session = learningMemory.getSession(sessionId);
  if (!session) {
    return { enhancedPrompt: prompt, contextAdded: [] };
  }

  const contextParts: string[] = [];
  const contextAdded: string[] = [];

  // Add user name if known
  if (session.userName) {
    contextParts.push(`User: ${session.userName}`);
    contextAdded.push('userName');
  }

  // Add relevant learned items from this session
  const sessionLearning = learningMemory.getSessionLearning(sessionId);
  const relevantLearning = sessionLearning.filter(item => 
    domains.includes(item.domain)
  );

  if (relevantLearning.length > 0) {
    const learningContext = relevantLearning
      .slice(-3) // Last 3 learned items
      .map(item => `${item.term}: ${item.definition}`)
      .join('\n');
    
    contextParts.push(`Recently learned:\n${learningContext}`);
    contextAdded.push('recentLearning');
  }

  // Add conversation history (last 3 turns)
  const history = learningMemory.getConversationHistory(sessionId, 3);
  if (history.length > 0) {
    const historyText = history
      .map(turn => `${turn.role}: ${turn.content}`)
      .join('\n');
    
    contextParts.push(`Recent conversation:\n${historyText}`);
    contextAdded.push('conversationHistory');
  }

  // Build enhanced prompt
  if (contextParts.length > 0) {
    const enhancedPrompt = `Context:\n${contextParts.join('\n\n')}\n\nCurrent query: ${prompt}`;
    return { enhancedPrompt, contextAdded };
  }

  return { enhancedPrompt: prompt, contextAdded: [] };
}

// ============================================================================
// Learning Analytics
// ============================================================================

/**
 * Get learning statistics for a session
 */
export function getSessionLearningStats(sessionId: string) {
  const session = learningMemory.getSession(sessionId);
  if (!session) return null;

  const learned = learningMemory.getSessionLearning(sessionId);
  
  const byDomain: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};

  learned.forEach(item => {
    byDomain[item.domain] = (byDomain[item.domain] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    bySource[item.learnedFrom] = (bySource[item.learnedFrom] || 0) + 1;
  });

  return {
    sessionId,
    userName: session.userName,
    totalLearned: learned.length,
    byDomain,
    byCategory,
    bySource,
    conversationTurns: session.metadata.totalTurns,
    domainsUsed: session.metadata.domainsUsed,
  };
}

/**
 * Get domain learning statistics
 */
export function getDomainLearningStats(domain: string) {
  const learned = learningMemory.getDomainLearning(domain);
  
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byDate: Record<string, number> = {};

  learned.forEach(item => {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    bySource[item.learnedFrom] = (bySource[item.learnedFrom] || 0) + 1;
    
    const date = item.timestamp.split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });

  return {
    domain,
    totalLearned: learned.length,
    byCategory,
    bySource,
    learningTimeline: byDate,
  };
}

// ============================================================================
// Export Helper Functions
// ============================================================================

/**
 * Quick function to learn from URL lookup result
 */
export function learnFromURLLookup(
  sessionId: string,
  domain: string,
  term: string,
  definition: string,
  source: string,
  context: string,
  options?: {
    examples?: string[];
    relatedTerms?: string[];
  }
): LearnedItem {
  return learningMemory.learnItem(
    sessionId,
    domain,
    'vocabulary',
    term,
    definition,
    source,
    context,
    {
      ...options,
      verified: true,
      learnedFrom: 'url-lookup',
    }
  );
}

/**
 * Quick function to learn from user input
 */
export function learnFromUserInput(
  sessionId: string,
  domain: string,
  term: string,
  definition: string,
  context: string
): LearnedItem {
  return learningMemory.learnItem(
    sessionId,
    domain,
    'vocabulary',
    term,
    definition,
    'user-provided',
    context,
    {
      confidence: 0.9,
      verified: false,
      learnedFrom: 'user-input',
    }
  );
}

/**
 * Quick function to learn from search results
 */
export function learnFromSearch(
  sessionId: string,
  domain: string,
  term: string,
  definition: string,
  source: string,
  context: string
): LearnedItem {
  return learningMemory.learnItem(
    sessionId,
    domain,
    'fact',
    term,
    definition,
    source,
    context,
    {
      confidence: 0.7,
      verified: false,
      learnedFrom: 'search',
    }
  );
}

// ============================================================================
// Type Definitions
// ============================================================================

interface UrlLookupData {
  definition: string;
  source: string;
  examples: string[];
  related: string[];
  type?: 'concept' | 'fact' | 'procedure';
}

function isUrlLookupData(data: unknown): data is UrlLookupData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const d = data as UrlLookupData;
  return (
    typeof d.definition === 'string' &&
    typeof d.source === 'string' &&
    Array.isArray(d.examples) &&
    Array.isArray(d.related)
  );
}
