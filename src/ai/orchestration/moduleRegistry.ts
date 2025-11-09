/**
 * File: src/ai/orchestration/moduleRegistry.ts
 * Purpose: Simple registry to register and lookup modules by name/version.
 */
export type ModuleFactory = () => unknown;

interface RegistryEntry {
  name: string;
  version?: string;
  factory: ModuleFactory;
}

const registry = new Map<string, RegistryEntry>();

export const registerModule = (
  name: string,
  factory: ModuleFactory,
  version?: string,
) => {
  registry.set(name, { name, version, factory });
};

export const getModule = (name: string): unknown | null => {
  const entry = registry.get(name);
  return entry ? entry.factory() : null;
};

export const listModules = (): RegistryEntry[] => Array.from(registry.values());
