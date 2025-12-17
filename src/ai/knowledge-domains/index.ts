/**
 * File: src/ai/knowledge-domains/index.ts
 * Purpose: Convenience API for domain registry and loading
 *
 * Usage in orchestrator:
 * import { loadAllDomains, getReadyDomains, getDomain } from "@/ai/knowledge-domains";
 */

import { domainScannerConfig } from "./config";
import { getRegistry, scanAndUpdate } from "../shared/registry/moduleRegistry";
import {
  getLoader,
  loadAllModules,
  loadModule,
  getLoadedModule,
  getAllLoadedModules,
  getReadyModules,
} from "../shared/registry/moduleLoader";
import type {
  ModuleRegistry,
  ModuleManifest,
} from "../shared/registry/moduleRegistry";
import type { LoadedModule } from "../shared/registry/moduleLoader";

// ============================================================================
// Registry APIs
// ============================================================================

export async function getDomainRegistry(
  forceRefresh = false,
): Promise<ModuleRegistry> {
  return await getRegistry(domainScannerConfig, forceRefresh);
}

export async function scanDomains(): Promise<ModuleRegistry> {
  return await scanAndUpdate(domainScannerConfig);
}

export async function getEnabledDomains(): Promise<ModuleManifest[]> {
  const registry = await getDomainRegistry();
  return registry.enabledModules
    .map((id) => registry.modules[id])
    .filter(Boolean);
}

export async function getDomain(
  domainId: string,
): Promise<ModuleManifest | null> {
  const registry = await getDomainRegistry();
  return registry.modules[domainId] || null;
}

export async function isDomainEnabled(domainId: string): Promise<boolean> {
  const registry = await getDomainRegistry();
  return registry.enabledModules.includes(domainId);
}

// ============================================================================
// Loader APIs
// ============================================================================

export async function loadAllDomains(): Promise<void> {
  await loadAllModules(domainScannerConfig);
}

export async function loadDomain(domainId: string): Promise<LoadedModule> {
  return await loadModule(domainScannerConfig, domainId);
}

export function getLoadedDomain(domainId: string): LoadedModule | null {
  return getLoadedModule(domainScannerConfig, domainId);
}

export function getAllLoadedDomains(): LoadedModule[] {
  return getAllLoadedModules(domainScannerConfig);
}

export function getReadyDomains(): LoadedModule[] {
  return getReadyModules(domainScannerConfig);
}

export async function reloadDomain(domainId: string): Promise<LoadedModule> {
  const loader = getLoader(domainScannerConfig);
  return await loader.reload(domainId);
}

export function getDomainLoaderStats() {
  const loader = getLoader(domainScannerConfig);
  return loader.getStats();
}

// ============================================================================
// Type Exports
// ============================================================================

export type {
  ModuleManifest as DomainManifest,
  ModuleRegistry as DomainRegistry,
};
export type { LoadedModule as LoadedDomain };
