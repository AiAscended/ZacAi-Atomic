import type { ModuleManifest } from "../orchestration/system";
import type { ModuleCategory } from "../orchestration/system/types";
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

const MODEL_CATEGORY: ModuleCategory = "model";

interface ModelRegistrySnapshot {
  version: string;
  lastScanned: string;
  moduleType: ModuleCategory;
  modules: Record<string, ModuleManifest>;
  enabledModules: string[];
  totalModules: number;
}

// ============================================================================
// Registry APIs
// ============================================================================

export async function getModelRegistry(forceRefresh = false): Promise<ModelRegistrySnapshot> {
  const registry = await getSystemRegistry(forceRefresh);
  const modules = registry.modules[MODEL_CATEGORY] ?? {};
  const enabledModules = Object.values(modules)
    .filter(manifest => manifest.enabled)
    .map(manifest => manifest.id);

  return {
    version: registry.version,
    lastScanned: registry.generatedAt,
    moduleType: MODEL_CATEGORY,
    modules,
    enabledModules,
    totalModules: Object.keys(modules).length,
  };
}

export async function scanModels(): Promise<ModuleManifest[]> {
  const registry = await rebuildRegistry();
  const modules = registry.modules[MODEL_CATEGORY] ?? {};
  return Object.values(modules);
}

export async function getEnabledModels(): Promise<ModuleManifest[]> {
  return await getModulesByCategory(MODEL_CATEGORY, { onlyEnabled: true });
}

export async function getModel(modelId: string): Promise<ModuleManifest | null> {
  return await getModuleManifest(MODEL_CATEGORY, modelId);
}

export async function getModelsByType(modelType: string): Promise<ModuleManifest[]> {
  const models = await getModulesByCategory(MODEL_CATEGORY);
  return models.filter(manifest => manifest.subtype === modelType || manifest.metadata?.modelType === modelType);
}

export async function isModelEnabled(modelId: string): Promise<boolean> {
  const manifest = await getModuleManifest(MODEL_CATEGORY, modelId);
  return Boolean(manifest?.enabled);
}

// ============================================================================
// Loader APIs
// ============================================================================

export async function loadAllModels(): Promise<void> {
  await loadCategoryModules(MODEL_CATEGORY);
}

export async function loadModel(modelId: string): Promise<LoadedSystemModule> {
  return await loadSystemModule(MODEL_CATEGORY, modelId);
}

export function getLoadedModel(modelId: string): LoadedSystemModule | null {
  return getLoadedSystemModule(MODEL_CATEGORY, modelId);
}

export function getAllLoadedModels(): LoadedSystemModule[] {
  return getAllLoadedSystemModules(MODEL_CATEGORY);
}

export function getReadyModels(): LoadedSystemModule[] {
  return getReadySystemModules(MODEL_CATEGORY);
}

export async function reloadModel(modelId: string): Promise<LoadedSystemModule> {
  return await loadSystemModule(MODEL_CATEGORY, modelId, { forceReload: true, forceRefresh: true });
}

export function getModelLoaderStats() {
  return getSystemLoaderStats();
}

export type ModelManifest = ModuleManifest;
export type ModelRegistry = ModelRegistrySnapshot;
export type LoadedModel = LoadedSystemModule;
