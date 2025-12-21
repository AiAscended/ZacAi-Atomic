/**
 * Fallback registry reader. In production this would read the unified
 * registry from persistent storage or a service. Here we return empty
 * datasets so the APIs stay online in degraded mode.
 */

import type { ModuleManifest, ModuleType } from "./unifiedRegistry";

export async function getModulesByType(_moduleType: ModuleType): Promise<ModuleManifest[]> {
  return [];
}

export async function getModuleById(_moduleId: string): Promise<ModuleManifest | null> {
  return null;
}
