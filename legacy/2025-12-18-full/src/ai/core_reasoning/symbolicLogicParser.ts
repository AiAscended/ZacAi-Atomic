/**
 * File: src/ai/core_reasoning/symbolicLogicParser.ts
 * Description: Very small symbolic logic expression parser (supports AND/OR/NOT parentheses).
 */

export const parseBooleanExpr = (
  expr: string,
): ((vars: Record<string, boolean>) => boolean) => {
  // This is a fragile, tiny parser for demo use only.
  return (_vars: Record<string, boolean>) => {
    // replace variable names with a lookup access placeholder; in a full impl you'd substitute safely
    const safe = expr.replace(
      /([a-zA-Z_][a-zA-Z0-9_]*)/g,
      (m) => `(_vars['${m}'])`,
    );
    const finalExpr = safe
      .replace(/\band\b/gi, "&&")
      .replace(/\bor\b/gi, "||")
      .replace(/\bnot\b/gi, "!");
    return Boolean(eval(finalExpr));
  };
};
