import fs from "fs/promises";
import path from "path";
import type { ModuleCategory } from "./types";

export interface SystemSettingsCategoryConfig {
  defaultEnabled?: boolean;
  overrides?: Record<string, boolean>;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  categories: Partial<Record<ModuleCategory, SystemSettingsCategoryConfig>>;
  allowlist?: Partial<Record<ModuleCategory, string[]>>;
  lastUpdated?: string;
}

export type ModuleEnablementReason =
  | "base-disabled"
  | "maintenance"
  | "allowlist"
  | "category-default"
  | "override"
  | "base";

export interface ModuleEnablementDecision {
  enabled: boolean;
  reason: ModuleEnablementReason;
}

export const SYSTEM_SETTINGS_FILE = path.join(
  process.cwd(),
  "src",
  "ai",
  "orchestration",
  "system",
  "SYSTEM_SETTINGS.json"
);

const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: true,
  categories: {},
  allowlist: {},
};

let cachedSettings: SystemSettings | null = null;

export async function getSystemSettings(forceRefresh = false): Promise<SystemSettings> {
  if (!forceRefresh && cachedSettings) {
    return cachedSettings;
  }

  cachedSettings = await loadSystemSettingsFromDisk();
  return cachedSettings;
}

export async function saveSystemSettings(next: SystemSettings): Promise<void> {
  const normalized = normalizeSettings({ ...next, lastUpdated: new Date().toISOString() });
  await fs.writeFile(SYSTEM_SETTINGS_FILE, JSON.stringify(normalized, null, 2), "utf8");
  cachedSettings = normalized;
}

export function setCachedSystemSettings(settings: SystemSettings): void {
  cachedSettings = normalizeSettings(settings);
}

export function resolveModuleEnablement(
  settings: SystemSettings,
  category: ModuleCategory,
  moduleId: string,
  baseEnabled: boolean
): ModuleEnablementDecision {
  if (!baseEnabled) {
    return { enabled: false, reason: "base-disabled" };
  }

  const allowlist = settings.allowlist?.[category] ?? [];
  if (settings.maintenanceMode) {
    if (allowlist.includes(moduleId)) {
      return { enabled: true, reason: "allowlist" };
    }

    const maintenanceOverride = settings.categories?.[category]?.overrides?.[moduleId];
    if (typeof maintenanceOverride === "boolean") {
      return { enabled: maintenanceOverride, reason: "override" };
    }

    return { enabled: false, reason: "maintenance" };
  }

  const categoryConfig = settings.categories?.[category];
  if (categoryConfig?.overrides && typeof categoryConfig.overrides[moduleId] === "boolean") {
    return { enabled: categoryConfig.overrides[moduleId], reason: "override" };
  }

  if (typeof categoryConfig?.defaultEnabled === "boolean") {
    if (!categoryConfig.defaultEnabled) {
      return { enabled: false, reason: "category-default" };
    }
  }

  return { enabled: true, reason: "base" };
}

async function loadSystemSettingsFromDisk(): Promise<SystemSettings> {
  try {
    const raw = await fs.readFile(SYSTEM_SETTINGS_FILE, "utf8");
    const parsed = JSON.parse(raw) as SystemSettings;
    return normalizeSettings(parsed);
  } catch {
    return normalizeSettings(DEFAULT_SETTINGS);
  }
}

function normalizeSettings(settings: SystemSettings): SystemSettings {
  return {
    maintenanceMode: Boolean(settings.maintenanceMode),
    categories: settings.categories ?? {},
    allowlist: settings.allowlist ?? {},
    lastUpdated: settings.lastUpdated ?? new Date().toISOString(),
  };
}
