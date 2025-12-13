/**
 * File: src/ai/core_reasoning/symbolicLogicParser.ts
 * Description: Very small symbolic logic expression parser (supports AND/OR/NOT parentheses).
 */

export const parseBooleanExpr = (expr: string): ((vars: Record<string, boolean>) => boolean) => {
  // This is a fragile, tiny parser for demo use only.
  const substituted = expr.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, (match) => `(vars['${match}'])`);
  const finalExpr = substituted
    .replace(/\band\b/gi, '&&')
    .replace(/\bor\b/gi, '||')
    .replace(/\bnot\b/gi, '!');

  const evaluator = new Function('vars', `return Boolean(${finalExpr});`) as (
    vars: Record<string, boolean>
  ) => boolean;

  return (vars: Record<string, boolean>) => evaluator(vars);
};
