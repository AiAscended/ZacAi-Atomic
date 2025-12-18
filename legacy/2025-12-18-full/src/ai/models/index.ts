/**
 * File: src/ai/models/index.ts
 * Purpose: Convenience API for model registry and loading
 *
 * Usage in orchestrator:
 * import { loadAllModels, getReadyModels, getModel } from "@/ai/models";
 */

import { modelScannerConfig } from "./config";
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

export async function getModelRegistry(
  forceRefresh = false,
): Promise<ModuleRegistry> {
  return await getRegistry(modelScannerConfig, forceRefresh);
}

export async function scanModels(): Promise<ModuleRegistry> {
  return await scanAndUpdate(modelScannerConfig);
}

export async function getEnabledModels(): Promise<ModuleManifest[]> {
  const registry = await getModelRegistry();
  return registry.enabledModules
    .map((id) => registry.modules[id])
    .filter(Boolean);
}

export async function getModel(
  modelId: string,
): Promise<ModuleManifest | null> {
  const registry = await getModelRegistry();
  return registry.modules[modelId] || null;
}

export async function getModelsByType(
  modelType: string,
): Promise<ModuleManifest[]> {
  const registry = await getModelRegistry();
  const ids = registry.byType?.[modelType] || [];
  return ids.map((id) => registry.modules[id]).filter(Boolean);
}

export async function isModelEnabled(modelId: string): Promise<boolean> {
  const registry = await getModelRegistry();
  return registry.enabledModules.includes(modelId);
}

// ============================================================================
// Loader APIs
// ============================================================================

export async function loadAllModels(): Promise<void> {
  await loadAllModules(modelScannerConfig);
}

export async function loadModel(modelId: string): Promise<LoadedModule> {
  return await loadModule(modelScannerConfig, modelId);
}

export function getLoadedModel(modelId: string): LoadedModule | null {
  return getLoadedModule(modelScannerConfig, modelId);
}

export function getAllLoadedModels(): LoadedModule[] {
  return getAllLoadedModules(modelScannerConfig);
}

export function getReadyModels(): LoadedModule[] {
  return getReadyModules(modelScannerConfig);
}

export async function reloadModel(modelId: string): Promise<LoadedModule> {
  const loader = getLoader(modelScannerConfig);
  return await loader.reload(modelId);
}

export function getModelLoaderStats() {
  const loader = getLoader(modelScannerConfig);
  return loader.getStats();
}

// ============================================================================
// Type Exports
// ============================================================================

export type {
  ModuleManifest as ModelManifest,
  ModuleRegistry as ModelRegistry,
};
export type { LoadedModule as LoadedModel };
