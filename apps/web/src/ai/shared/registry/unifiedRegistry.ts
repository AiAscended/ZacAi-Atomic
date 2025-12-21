/**
 * Minimal unified registry types and fallback data.
 * Provides enough structure for admin APIs to operate in degraded mode
 * without throwing module resolution errors.
 */

export type ModuleType = "domain" | "model" | "tool" | "service" | string;

export interface ModuleManifest {
  moduleId: string;
  displayName: string;
  description: string;
  moduleType: ModuleType;
  enabled: boolean;
  path?: string;
  version?: string;
}

export interface UnifiedRegistrySnapshot {
  generatedAt: number;
  modules: ModuleManifest[];
}

export function getEmptyRegistry(): UnifiedRegistrySnapshot {
  return { generatedAt: Date.now(), modules: [] };
}
