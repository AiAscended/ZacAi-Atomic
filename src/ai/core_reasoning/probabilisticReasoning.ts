/**
 * File: src/ai/core_reasoning/probabilisticReasoning.ts
 * Description: Small utilities for probability conversions and Bayes update.
 */

export const logit = (p: number) => Math.log(p / (1 - p));
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export const bayesUpdate = (prior: number, likelihoodRatio: number) => {
  const odds = prior / (1 - prior);
  const updatedOdds = odds * likelihoodRatio;
  return updatedOdds / (1 + updatedOdds);
};
