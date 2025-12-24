/**
 * Core type definitions for the orchestrator-wide system registry/loader.
 */

export type ModuleCategory =
  | "model"
  | "domain"
  | "tool"
  | "agent"
  | "utility"
  | "pipeline"
  | "hco"
  | "cell";

export type ModuleEntriesMap = Record<string, string | null>;
export type ModuleStructureMap = Record<string, boolean>;

export interface ModuleFileDescriptor {
  relativePath: string;
  absolutePath: string;
  size: number;
  modifiedAt: string;
}

export interface ModuleCategoryConfig {
  category: ModuleCategory;
  label: string;
  description?: string;
  rootDir: string;
  treatEachSubdirectoryAsModule?: boolean;
  entryFiles?: Record<string, RegExp>;
  structureIndicators?: Record<string, RegExp>;
  requiredEntries?: string[];
  skipFolders?: string[];
  skipFiles?: string[];
  tags?: string[];
  loaderEntryKeys?: string[];
  metadataExtractor?: (ctx: ModuleScanContext) => Promise<Record<string, unknown>> | Record<string, unknown>;
  enablementStrategy?: (ctx: ModuleScanContext) => Promise<boolean> | boolean;
}

export interface ModuleManifest {
  id: string;
  name: string;
  category: ModuleCategory;
  relativePath: string;
  absolutePath: string;
  entries: ModuleEntriesMap;
  structure: ModuleStructureMap;
  enabled: boolean;
  status: "enabled" | "disabled" | "error";
  tags: string[];
  fileCount: number;
  size: number;
  subtype?: string;
  metadata: Record<string, unknown>;
  discoveredAt: string;
  updatedAt: string;
}

export interface ModuleScanContext {
  config: ModuleCategoryConfig;
  moduleId: string;
  moduleName: string;
  absolutePath: string;
  relativePath: string;
  files: ModuleFileDescriptor[];
  entries: ModuleEntriesMap;
  structure: ModuleStructureMap;
}

export interface FileInventoryRecord {
  path: string;
  size: number;
  modifiedAt: string;
  hash?: string;
  extension: string;
}

export interface SystemRegistryStats {
  totalModules: number;
  totalFiles: number;
  byCategory: Record<ModuleCategory, number>;
}

export interface SystemRegistry {
  version: string;
  generatedAt: string;
  repoRoot: string;
  modules: Partial<Record<ModuleCategory, Record<string, ModuleManifest>>>;
  files: FileInventoryRecord[];
  stats: SystemRegistryStats;
}

export interface RegistryQueryOptions {
  forceRefresh?: boolean;
  onlyEnabled?: boolean;
}
