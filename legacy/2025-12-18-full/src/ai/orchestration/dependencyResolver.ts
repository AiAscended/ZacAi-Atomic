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

  for (const name of names) {
    if (available.has(name)) {
      resolved.push(name);
    } else {
      missing.push(name);
    }
  }

  return { missing, resolved };
};

const collectModuleNames = (registry: Awaited<ReturnType<typeof getSystemRegistry>>): Set<string> => {
  const names = new Set<string>();

  for (const categoryGroup of Object.values(registry.modules)) {
    for (const manifest of Object.values(categoryGroup)) {
      names.add(manifest.name);
      names.add(manifest.id);
    }
  }

  return names;
};
