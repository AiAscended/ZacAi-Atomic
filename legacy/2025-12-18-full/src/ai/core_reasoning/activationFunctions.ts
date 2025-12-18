/**
 * File: src/ai/core_reasoning/activationFunctions.ts
 * Description: Common activation functions used in neural networks.
 * Dependencies: none
 */

export const relu = (x: number): number => Math.max(0, x);
export const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
export const tanh = (x: number): number => Math.tanh(x);
