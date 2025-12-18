import * as fs from "fs/promises";
import * as path from "path";
import type { ModuleManifest, ModuleType, UnifiedRegistry } from "./unifiedRegistry";

const REGISTRY_PATH = path.join(process.cwd(), "src", "ai", "UNIFIED_REGISTRY.json");
const CACHE_TTL_MS = 60_000;

let cachedRegistry: { data: UnifiedRegistry; timestamp: number } | null = null;

async function readRegistryFromDisk(): Promise<UnifiedRegistry> {
  const content = await fs.readFile(REGISTRY_PATH, "utf8");
  return JSON.parse(content) as UnifiedRegistry;
}

export async function readUnifiedRegistry(): Promise<UnifiedRegistry> {
  const now = Date.now();
  if (cachedRegistry && now - cachedRegistry.timestamp < CACHE_TTL_MS) {
    return cachedRegistry.data;
  }

  const registry = await readRegistryFromDisk();
  cachedRegistry = { data: registry, timestamp: now };
  return registry;
}

export function clearUnifiedRegistryCache(): void {
  cachedRegistry = null;
}

export async function getModulesByType(moduleType: ModuleType): Promise<ModuleManifest[]> {
  const registry = await readUnifiedRegistry();
  return Object.values(registry.modules).filter((module) => module.moduleType === moduleType);
}

export async function getModuleById(moduleId: string): Promise<ModuleManifest | null> {
  const registry = await readUnifiedRegistry();
  return registry.modules[moduleId] ?? null;
}
