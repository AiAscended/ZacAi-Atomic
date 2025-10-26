/**
 * File: src/ai/context_management/intentClassifier.ts
 * Purpose: Very small intent classifier using keyword heuristics for MVP.
 */

export const classifyIntent = (text: string): { intent: string; confidence: number } => {
  const t = text.toLowerCase();
  if (t.includes('help') || t.includes('support') || t.includes('how do i')) return { intent: 'help_request', confidence: 0.9 };
  if (t.includes('buy') || t.includes('purchase') || t.includes('price')) return { intent: 'purchase_query', confidence: 0.88 };
  if (t.includes('bug') || t.includes('error') || t.includes('fail')) return { intent: 'bug_report', confidence: 0.86 };
  return { intent: 'general_chat', confidence: 0.6 };
};
