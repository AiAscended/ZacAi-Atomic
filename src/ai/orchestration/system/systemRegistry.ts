import crypto from "crypto";
import type { Dirent } from "fs";
import fs from "fs/promises";
import path from "path";
import {
  DEFAULT_SKIP_FILES,
  DEFAULT_SKIP_FOLDERS,
  SYSTEM_REGISTRY_FILE,
  formatModuleName,
  getCategoryConfig,
  moduleCategoryConfigs,
} from "./moduleConfigs";
import { getSystemSettings, resolveModuleEnablement } from "./systemSettings";
import type { SystemSettings } from "./systemSettings";
import type {
  FileInventoryRecord,
  ModuleCategory,
  ModuleCategoryConfig,
  ModuleEntriesMap,
  ModuleFileDescriptor,
  ModuleManifest,
  ModuleScanContext,
  ModuleStructureMap,
  RegistryQueryOptions,
  SystemRegistry,
} from "./types";

const REGISTRY_VERSION = "3.0.0";
const MAX_HASH_BYTES = 1_000_000; // 1 MB safety cap for hashing

let registryCache: SystemRegistry | null = null;

// ============================================================================
// Public API
// ============================================================================

export async function getSystemRegistry(forceRefresh = false): Promise<SystemRegistry> {
  if (forceRefresh) {
    return await rebuildRegistry();
  }

  if (registryCache) {
    return registryCache;
  }

  const disk = await loadRegistryFromDisk();
  if (disk) {
    registryCache = disk;
    return disk;
  }

  return await rebuildRegistry();
}

export async function rebuildRegistry(): Promise<SystemRegistry> {
  const registry = await scanWorkspace();
  registryCache = registry;
  await saveRegistryToDisk(registry);
  return registry;
}

export function clearRegistryCache(): void {
  registryCache = null;
}

export async function getModulesByCategory(
  category: ModuleCategory,
  options: RegistryQueryOptions = {}
): Promise<ModuleManifest[]> {
  const registry = await getSystemRegistry(options.forceRefresh ?? false);
  const group = registry.modules[category] ?? {};
  const modules = Object.values(group);
  return options.onlyEnabled ? modules.filter(module => module.enabled) : modules;
}

export async function getModuleManifest(
  category: ModuleCategory,
  moduleId: string,
  options: RegistryQueryOptions = {}
): Promise<ModuleManifest | null> {
  const registry = await getSystemRegistry(options.forceRefresh ?? false);
  const group = registry.modules[category];
  if (!group) return null;
  const manifest = group[moduleId];
  if (!manifest) return null;
  if (options.onlyEnabled && !manifest.enabled) {
    return null;
  }
  return manifest;
}

export async function getFileInventory(forceRefresh = false): Promise<FileInventoryRecord[]> {
  const registry = await getSystemRegistry(forceRefresh);
  return registry.files;
}

// ============================================================================
// Scanning Logic
// ============================================================================

async function scanWorkspace(): Promise<SystemRegistry> {
  const generatedAt = new Date().toISOString();
  const modules: SystemRegistry["modules"] = {};
  const byCategory = {} as SystemRegistry["stats"]["byCategory"];
  const settings = await getSystemSettings();

  for (const config of moduleCategoryConfigs) {
    const scanned = await scanCategory(config, settings);
    modules[config.category] = scanned;
    byCategory[config.category] = Object.keys(scanned).length;
  }

  const files = await collectWorkspaceFiles();
  const totalModules = Object.values(byCategory).reduce((sum, value) => sum + value, 0);

  return {
    version: REGISTRY_VERSION,
    generatedAt,
    repoRoot: process.cwd(),
    modules,
    files,
    stats: {
      totalModules,
      totalFiles: files.length,
      byCategory,
    },
  };
}

async function scanCategory(
  config: ModuleCategoryConfig,
  settings: SystemSettings
): Promise<Record<string, ModuleManifest>> {
  const results: Record<string, ModuleManifest> = {};
  if (!(await pathExists(config.rootDir))) {
    return results;
  }

  const treatSubdirs = config.treatEachSubdirectoryAsModule !== false;
  const entries = await fs.readdir(config.rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    if (shouldSkip(entry.name, config.skipFolders)) continue;

    if (!treatSubdirs && entry.name !== path.basename(config.rootDir)) {
      continue;
    }

    const manifest = await buildManifest(config, entry.name, settings);
    results[manifest.id] = manifest;
  }

  return results;
}

async function buildManifest(
  config: ModuleCategoryConfig,
  folderName: string,
  settings: SystemSettings
): Promise<ModuleManifest> {
  const absolutePath = path.join(config.rootDir, folderName);
  const relativePath = path.relative(process.cwd(), absolutePath);
  const files = await readDirectoryRecursive(absolutePath, config);

  const structure = buildStructureMap(files, config.structureIndicators);
  const entries = buildEntriesMap(files, config.entryFiles);

  const moduleName = formatModuleName(folderName);
  const ctx: ModuleScanContext = {
    config,
    moduleId: folderName,
    moduleName,
    absolutePath,
    relativePath,
    files,
    entries,
    structure,
  };

  const metadata = config.metadataExtractor ? await config.metadataExtractor(ctx) : {};
  const meetsRequirements = (config.requiredEntries ?? []).every(key => !!entries[key]);
  const strategyPass = config.enablementStrategy ? await config.enablementStrategy(ctx) : true;
  const baseEnabled = meetsRequirements && strategyPass;
  const enablementDecision = resolveModuleEnablement(settings, config.category, folderName, baseEnabled);
  const manifestEnabled = enablementDecision.enabled;
  const manifestStatus: ModuleManifest["status"] = manifestEnabled ? "enabled" : "disabled";
  const manifestMetadata = {
    ...metadata,
    enablementReason: enablementDecision.reason,
  };

  const manifest: ModuleManifest = {
    id: folderName,
    name: moduleName,
    category: config.category,
    relativePath,
    absolutePath,
    entries,
    structure,
    enabled: manifestEnabled,
    status: manifestStatus,
    tags: config.tags ?? [],
    fileCount: files.length,
    size: files.reduce((sum, file) => sum + file.size, 0),
    subtype: typeof metadata?.modelType === "string" ? (metadata.modelType as string) : undefined,
    metadata: manifestMetadata,
    discoveredAt: new Date().toISOString(),
    updatedAt: getLatestModifiedAt(files),
  };

  return manifest;
}

function buildStructureMap(
  files: ModuleFileDescriptor[],
  indicators?: Record<string, RegExp>
): ModuleStructureMap {
  const structure: ModuleStructureMap = {};
  if (!indicators) {
    return structure;
  }

  for (const [key, pattern] of Object.entries(indicators)) {
    structure[key] = files.some(file => pattern.test(file.relativePath));
  }

  return structure;
}

function buildEntriesMap(
  files: ModuleFileDescriptor[],
  entryFiles?: Record<string, RegExp>
): ModuleEntriesMap {
  const entries: ModuleEntriesMap = {};
  if (!entryFiles) {
    return entries;
  }

  for (const [key, pattern] of Object.entries(entryFiles)) {
    const match = files.find(file => pattern.test(file.relativePath));
    entries[key] = match ? match.relativePath : null;
  }

  return entries;
}

async function readDirectoryRecursive(
  dir: string,
  config: ModuleCategoryConfig,
  base = ""
): Promise<ModuleFileDescriptor[]> {
  const files: ModuleFileDescriptor[] = [];
  const skipFolders = new Set([
    ...DEFAULT_SKIP_FOLDERS,
    ...(config.skipFolders ?? []),
  ]);
  const skipFiles = new Set([
    ...DEFAULT_SKIP_FILES,
    ...(config.skipFiles ?? []),
  ]);

  let entries: Dirent[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const relativePath = base ? `${base}/${entry.name}` : entry.name;
    if (skipFiles.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (skipFolders.has(entry.name)) continue;
      const nested = await readDirectoryRecursive(fullPath, config, relativePath);
      files.push(...nested);
      continue;
    }

    try {
      const stats = await fs.stat(fullPath);
      files.push({
        relativePath,
        absolutePath: fullPath,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      });
    } catch {
      // Ignore unreadable files
    }
  }

  return files;
}

// ============================================================================
// File Inventory
// ============================================================================

async function collectWorkspaceFiles(): Promise<FileInventoryRecord[]> {
  return await walkWorkspace(process.cwd());
}

async function walkWorkspace(dir: string, base = ""): Promise<FileInventoryRecord[]> {
  const records: FileInventoryRecord[] = [];
  let entries: Dirent[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return records;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      if (entry.name === ".env") {
        // keep .env files for awareness
      } else if (DEFAULT_SKIP_FOLDERS.includes(entry.name)) {
        continue;
      }
    }

    if (DEFAULT_SKIP_FOLDERS.includes(entry.name)) continue;
    if (DEFAULT_SKIP_FILES.includes(entry.name)) continue;

    const relativePath = base ? `${base}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = await walkWorkspace(fullPath, relativePath);
      records.push(...nested);
      continue;
    }

    try {
      const stats = await fs.stat(fullPath);
      records.push({
        path: relativePath,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
        hash: await maybeHashFile(fullPath, stats.size),
        extension: path.extname(entry.name).replace(/^\./, "") || "",
      });
    } catch {
      // Ignore unreadable files
    }
  }

  return records;
}

async function maybeHashFile(filePath: string, size: number): Promise<string | undefined> {
  if (size === 0) {
    return crypto.createHash("sha1").update("").digest("hex");
  }
  if (size > MAX_HASH_BYTES) {
    return undefined;
  }
  try {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash("sha1").update(buffer).digest("hex");
  } catch {
    return undefined;
  }
}

// ============================================================================
// Persistence Helpers
// ============================================================================

async function saveRegistryToDisk(registry: SystemRegistry): Promise<void> {
  try {
    await fs.writeFile(SYSTEM_REGISTRY_FILE, JSON.stringify(registry, null, 2), "utf8");
  } catch (error) {
    console.warn("[systemRegistry] Failed to persist registry", error);
  }
}

async function loadRegistryFromDisk(): Promise<SystemRegistry | null> {
  try {
    const content = await fs.readFile(SYSTEM_REGISTRY_FILE, "utf8");
    return JSON.parse(content) as SystemRegistry;
  } catch {
    return null;
  }
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function shouldSkip(name: string, extra?: string[]): boolean {
  if (!name) return true;
  if (DEFAULT_SKIP_FOLDERS.includes(name)) return true;
  if (extra && extra.includes(name)) return true;
  return false;
}

function getLatestModifiedAt(files: ModuleFileDescriptor[]): string {
  if (files.length === 0) {
    return new Date(0).toISOString();
  }
  const latest = files.reduce((candidate, file) =>
    file.modifiedAt > candidate ? file.modifiedAt : candidate,
    files[0].modifiedAt
  );
  return latest;
}
