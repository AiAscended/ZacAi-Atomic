import type { ModuleManifest } from "../orchestration/system";
import {
  getSystemRegistry,
  rebuildRegistry,
  getModulesByCategory,
  getModuleManifest,
} from "../orchestration/system/systemRegistry";
import {
  getAllLoadedSystemModules,
  getLoadedSystemModule,
  getReadySystemModules,
  getSystemLoaderStats,
  loadCategoryModules,
  loadSystemModule,
} from "../orchestration/system/systemLoader";
import type { LoadedSystemModule } from "../orchestration/system/systemLoader";
import type { ModuleCategory } from "../orchestration/system/types";

const DOMAIN_CATEGORY: ModuleCategory = "domain";

interface DomainRegistrySnapshot {
  version: string;
  lastScanned: string;
  moduleType: ModuleCategory;
  modules: Record<string, ModuleManifest>;
  enabledModules: string[];
  totalModules: number;
}

// ============================================================================
// Registry APIs (single source of truth)
// ============================================================================

export async function getDomainRegistry(forceRefresh = false): Promise<DomainRegistrySnapshot> {
  const registry = await getSystemRegistry(forceRefresh);
  const modules = registry.modules[DOMAIN_CATEGORY] ?? {};
  const enabledModules = Object.values(modules)
    .filter(manifest => manifest.enabled)
    .map(manifest => manifest.id);

  return {
    version: registry.version,
    lastScanned: registry.generatedAt,
    moduleType: DOMAIN_CATEGORY,
    modules,
    enabledModules,
    totalModules: Object.keys(modules).length,
  };
}

export async function scanDomains(): Promise<ModuleManifest[]> {
  const registry = await rebuildRegistry();
  const modules = registry.modules[DOMAIN_CATEGORY] ?? {};
  return Object.values(modules);
}

export async function getEnabledDomains(): Promise<ModuleManifest[]> {
  return await getModulesByCategory(DOMAIN_CATEGORY, { onlyEnabled: true });
}

export async function getDomain(domainId: string): Promise<ModuleManifest | null> {
  return await getModuleManifest(DOMAIN_CATEGORY, domainId);
}

export async function isDomainEnabled(domainId: string): Promise<boolean> {
  const manifest = await getModuleManifest(DOMAIN_CATEGORY, domainId);
  return Boolean(manifest?.enabled);
}

// ============================================================================
// Loader APIs
// ============================================================================

export async function loadAllDomains(): Promise<void> {
  await loadCategoryModules(DOMAIN_CATEGORY);
}

export async function loadDomain(domainId: string): Promise<LoadedSystemModule> {
  return await loadSystemModule(DOMAIN_CATEGORY, domainId);
}

export function getLoadedDomain(domainId: string): LoadedSystemModule | null {
  return getLoadedSystemModule(DOMAIN_CATEGORY, domainId);
}

export function getAllLoadedDomains(): LoadedSystemModule[] {
  return getAllLoadedSystemModules(DOMAIN_CATEGORY);
}

export function getReadyDomains(): LoadedSystemModule[] {
  return getReadySystemModules(DOMAIN_CATEGORY);
}

export async function reloadDomain(domainId: string): Promise<LoadedSystemModule> {
  return await loadSystemModule(DOMAIN_CATEGORY, domainId, { forceReload: true, forceRefresh: true });
}

export function getDomainLoaderStats() {
  return getSystemLoaderStats();
}

export type DomainManifest = ModuleManifest;
export type DomainRegistry = DomainRegistrySnapshot;
export type LoadedDomain = LoadedSystemModule;
