/**
 * File: src/ai/core_reasoning/constraintSolver.ts
 * Description: Tiny constraint satisfier using brute-force enumeration for boolean variables (MVP only).
 */

export const solveBooleanConstraints = (
  vars: string[],
  predicate: (assignment: Record<string, boolean>) => boolean,
): Record<string, boolean> | null => {
  const n = vars.length;
  for (let m = 0; m < 1 << n; m++) {
    const assign: Record<string, boolean> = {};
    for (let i = 0; i < n; i++) assign[vars[i]] = !!(m & (1 << i));
    if (predicate(assign)) return assign;
  }
  return null;
};
