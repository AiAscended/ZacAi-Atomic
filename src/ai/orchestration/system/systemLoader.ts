import {
  getSystemRegistry,
  getModuleManifest,
  getModulesByCategory,
} from "./systemRegistry";
import { getSystemSettings, resolveModuleEnablement } from "./systemSettings";
import { getCategoryConfig } from "./moduleConfigs";
import type {
  ModuleCategory,
  ModuleManifest,
  RegistryQueryOptions,
} from "./types";

export interface LoadedSystemModule {
  key: string;
  category: ModuleCategory;
  manifest: ModuleManifest;
  instance: unknown;
  loadedAt: string;
  status: "ready" | "loading" | "error" | "disabled";
  error?: string;
}

export interface LoadOptions extends RegistryQueryOptions {
  forceReload?: boolean;
}

export class SystemLoader {
  private readonly loaded = new Map<string, LoadedSystemModule>();

  async primeWorkspace(categories?: ModuleCategory[], options: RegistryQueryOptions = {}): Promise<void> {
    await getSystemRegistry(options.forceRefresh ?? false);
    const categoryList = categories ?? (await this.resolveAllCategories());
    for (const category of categoryList) {
      await this.loadCategory(category, options);
    }
  }

  async loadCategory(category: ModuleCategory, options: RegistryQueryOptions = {}): Promise<void> {
    const manifests = await getModulesByCategory(category, options);
    for (const manifest of manifests) {
      await this.loadModule(category, manifest.id, options);
    }
  }

  async loadModule(
    category: ModuleCategory,
    moduleId: string,
    options: LoadOptions = {}
  ): Promise<LoadedSystemModule> {
    const key = this.buildKey(category, moduleId);
    if (!options.forceReload && this.loaded.has(key)) {
      const cached = this.loaded.get(key)!;
      if (cached.status === "ready" || cached.status === "disabled") {
        return cached;
      }
    }

    const manifest = await this.ensureManifest(category, moduleId, options);
    const settings = await getSystemSettings();
    const enablementDecision = resolveModuleEnablement(settings, category, moduleId, manifest.enabled);
    const effectiveManifest: ModuleManifest = {
      ...manifest,
      enabled: enablementDecision.enabled,
      status: enablementDecision.enabled ? "enabled" : "disabled",
      metadata: {
        ...manifest.metadata,
        enablementReason: enablementDecision.reason,
      },
    };

    if (!enablementDecision.enabled) {
      const disabled: LoadedSystemModule = {
        key,
        category,
        manifest: effectiveManifest,
        instance: null,
        loadedAt: new Date().toISOString(),
        status: "disabled",
        error: enablementDecision.reason === "base-disabled" ? "Module requirements not satisfied" : undefined,
      };
      this.loaded.set(key, disabled);
      return disabled;
    }

    const placeholder: LoadedSystemModule = {
      key,
      category,
      manifest: effectiveManifest,
      instance: null,
      loadedAt: new Date().toISOString(),
      status: "loading",
    };
    this.loaded.set(key, placeholder);

    try {
      placeholder.instance = await this.importModule(effectiveManifest);
      placeholder.status = "ready";
    } catch (error) {
      placeholder.status = "error";
      placeholder.error = error instanceof Error ? error.message : String(error);
    }

    return placeholder;
  }

  unloadModule(category: ModuleCategory, moduleId: string): void {
    const key = this.buildKey(category, moduleId);
    if (this.loaded.has(key)) {
      this.loaded.delete(key);
    }
  }

  getLoadedModule(category: ModuleCategory, moduleId: string): LoadedSystemModule | null {
    return this.loaded.get(this.buildKey(category, moduleId)) ?? null;
  }

  getReadyModules(category?: ModuleCategory): LoadedSystemModule[] {
    const modules = Array.from(this.loaded.values()).filter(record => record.status === "ready");
    if (!category) return modules;
    return modules.filter(record => record.category === category);
  }

  getLoadedModules(category?: ModuleCategory): LoadedSystemModule[] {
    const modules = Array.from(this.loaded.values());
    if (!category) return modules;
    return modules.filter(record => record.category === category);
  }

  getStats() {
    const totals = Array.from(this.loaded.values()).reduce(
      (acc, record) => {
        acc.total += 1;
        acc[record.status] += 1;
        return acc;
      },
      { total: 0, ready: 0, loading: 0, error: 0, disabled: 0 }
    );
    return totals;
  }

  async importModule(manifest: ModuleManifest): Promise<unknown> {
    const config = getCategoryConfig(manifest.category);
    if (!config) {
      throw new Error(`Missing loader config for category: ${manifest.category}`);
    }

    const entryCandidates = this.resolveEntryCandidates(manifest, config);
    if (entryCandidates.length === 0) {
      throw new Error(`No entry point recorded for ${manifest.category}:${manifest.id}`);
    }

    let lastError: unknown;
    for (const entry of entryCandidates) {
      const specifier = buildAliasImport(manifest.relativePath, entry);
      try {
        const imported = await import(specifier);
        return (imported as Record<string, unknown>).default ?? imported;
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(
      `Failed to import ${manifest.category}:${manifest.id} (${entryCandidates.join(", ")})` +
        (lastError instanceof Error ? `\n${lastError.message}` : "")
    );
  }

  private resolveEntryCandidates(
    manifest: ModuleManifest,
    config: ReturnType<typeof getCategoryConfig>
  ): string[] {
    if (!config) return [];
    const preferred = config.loaderEntryKeys ?? [];
    const available = Object.entries(manifest.entries)
      .filter(([, value]) => !!value)
      .map(([key, value]) => ({ key, value: value! }));

    const ordered: string[] = [];

    for (const key of preferred) {
      const match = available.find(entry => entry.key === key);
      if (match) {
        ordered.push(match.value);
      }
    }

    for (const entry of available) {
      if (!ordered.includes(entry.value)) {
        ordered.push(entry.value);
      }
    }

    return ordered;
  }

  private async ensureManifest(
    category: ModuleCategory,
    moduleId: string,
    options: RegistryQueryOptions
  ): Promise<ModuleManifest> {
    const manifest = await getModuleManifest(category, moduleId, options);
    if (!manifest) {
      throw new Error(`Module not found: ${category}:${moduleId}`);
    }
    return manifest;
  }

  private buildKey(category: ModuleCategory, moduleId: string): string {
    return `${category}:${moduleId}`;
  }

  private async resolveAllCategories(): Promise<ModuleCategory[]> {
    const registry = await getSystemRegistry();
    return Object.keys(registry.modules) as ModuleCategory[];
  }
}

export function getSystemLoader(): SystemLoader {
  if (!globalThis.__zacaiSystemLoader) {
    Object.defineProperty(globalThis, "__zacaiSystemLoader", {
      value: new SystemLoader(),
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }
  return globalThis.__zacaiSystemLoader as SystemLoader;
}

export async function loadAllSystemModules(
  categories?: ModuleCategory[],
  options: RegistryQueryOptions = {}
): Promise<void> {
  const loader = getSystemLoader();
  await loader.primeWorkspace(categories, options);
}

export async function loadCategoryModules(
  category: ModuleCategory,
  options: RegistryQueryOptions = {}
): Promise<void> {
  const loader = getSystemLoader();
  await loader.loadCategory(category, options);
}

export async function loadSystemModule(
  category: ModuleCategory,
  moduleId: string,
  options: LoadOptions = {}
): Promise<LoadedSystemModule> {
  const loader = getSystemLoader();
  return loader.loadModule(category, moduleId, options);
}

export function getLoadedSystemModule(
  category: ModuleCategory,
  moduleId: string
): LoadedSystemModule | null {
  return getSystemLoader().getLoadedModule(category, moduleId);
}

export function getReadySystemModules(category?: ModuleCategory): LoadedSystemModule[] {
  return getSystemLoader().getReadyModules(category);
}

export function getAllLoadedSystemModules(category?: ModuleCategory): LoadedSystemModule[] {
  return getSystemLoader().getLoadedModules(category);
}

export function getSystemLoaderStats() {
  return getSystemLoader().getStats();
}

declare global {
  var __zacaiSystemLoader: SystemLoader | undefined;
}

function buildAliasImport(moduleRelativePath: string, entry: string): string {
  const normalizedRoot = normalizeModuleRoot(moduleRelativePath);
  const cleanedEntry = entry.replace(/^\.\//, "").replace(/\\/g, "/");
  return `@/${normalizedRoot}/${cleanedEntry}`;
}

function normalizeModuleRoot(moduleRelativePath: string): string {
  const normalized = moduleRelativePath.replace(/\\/g, "/");
  return normalized.startsWith("src/") ? normalized.slice(4) : normalized;
}
