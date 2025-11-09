/**
 * File: src/ai/orchestration/dependencyResolver.ts
 * Purpose: Lightweight dependency resolver that ensures declared dependencies are available.
 */

import { listModules } from "./moduleRegistry";

export const resolveDependencies = (
  names: string[],
): { missing: string[]; resolved: string[] } => {
  const available = new Set(listModules().map((m) => m.name));
  const resolved: string[] = [];
  const missing: string[] = [];
  for (const n of names) {
    if (available.has(n)) resolved.push(n);
    else missing.push(n);
  }
  return { missing, resolved };
};
