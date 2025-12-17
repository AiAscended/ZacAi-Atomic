/**
 * File: src/ai/core_reasoning/explainabilityGenerator.ts
 * Description: Generate simple textual explanations for decisions using templates.
 * Dependencies: probabilisticReasoning
 */

import { bayesUpdate } from "./probabilisticReasoning";

export const generateSimpleExplanation = (
  fact: string,
  prior: number,
  lr: number,
): string => {
  const posterior = bayesUpdate(prior, lr);
  return `Based on evidence '${fact}', probability updated from ${prior.toFixed(2)} to ${posterior.toFixed(2)}.`;
};
