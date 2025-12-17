import { createHash } from "node:crypto"
import { registerHeartCore } from "../core/boot"
import { systemModel, type RegisterComponentInput } from "../system-model"
import { getSystemSettings } from "../orchestration/system/systemSettings"
import type { ExecutionContext } from "../types"
import type { KernelHealthSnapshot, KernelOptions, KernelStatus } from "./types"

type MaintenanceSettings = Awaited<ReturnType<typeof getSystemSettings>>

const SYSTEM_SETTINGS_SOURCE = "SYSTEM_SETTINGS.json"

export class SystemKernel {
  private initialized = false
  private status: KernelStatus = "cold"
  private readonly minRefreshIntervalMs: number
  private lastSettingsChecksum: string | null = null
  private lastSettings: MaintenanceSettings | null = null
  private lastContextRefreshAt: string | null = null
  private lastRefreshTimestamp = 0

  constructor(options: KernelOptions = {}) {
    this.minRefreshIntervalMs = options.minSettingsRefreshMs ?? 30_000
  }

  async initialize(force = false): Promise<void> {
    if (this.initialized && !force) {
      return
    }

    this.status = "initializing"
    await this.refreshContext(true)
    registerHeartCore()
    this.ensureKernelComponent()

    this.initialized = true
    this.status = "ready"
  }

  async refreshContext(force = false): Promise<MaintenanceSettings> {
    const now = Date.now()
    const withinInterval = now - this.lastRefreshTimestamp < this.minRefreshIntervalMs
    if (!force && this.lastSettings && withinInterval) {
      return this.lastSettings
    }

    const settings = await getSystemSettings(force)
    const checksum = this.calculateChecksum(settings)
    if (!force && this.lastSettings && checksum === this.lastSettingsChecksum && withinInterval) {
      return this.lastSettings
    }

    this.applySettingsToContext(settings, checksum)
    this.lastSettings = settings
    this.lastSettingsChecksum = checksum
    this.lastContextRefreshAt = new Date().toISOString()
    this.lastRefreshTimestamp = now
    return settings
  }

  registerComponent(input: RegisterComponentInput) {
    return systemModel.registerComponent(input)
  }

  getContext(): ExecutionContext {
    return systemModel.getContext()
  }

  getStatus(): KernelHealthSnapshot {
    return {
      status: this.status,
      initialized: this.initialized,
      maintenanceMode: systemModel.getContext().maintenanceMode,
      lastContextRefreshAt: this.lastContextRefreshAt,
      lastSettingsChecksum: this.lastSettingsChecksum,
      registeredComponents: systemModel.listComponents().length,
      context: systemModel.getContext(),
    }
  }

  getSettingsSummary() {
    return {
      checksum: this.lastSettingsChecksum,
      maintenanceMode: this.lastSettings?.maintenanceMode ?? true,
      allowlistSize: Object.keys(this.lastSettings?.allowlist ?? {}).length,
      categoryCount: Object.keys(this.lastSettings?.categories ?? {}).length,
      source: SYSTEM_SETTINGS_SOURCE,
    }
  }

  /** Testing helper */
  resetForTesting() {
    this.initialized = false
    this.status = "cold"
    this.lastSettingsChecksum = null
    this.lastSettings = null
    this.lastContextRefreshAt = null
    this.lastRefreshTimestamp = 0
  }

  private ensureKernelComponent() {
    systemModel.registerComponent({
      id: "system-kernel",
      name: "System Kernel",
      kind: "core",
      capabilities: ["context-sync", "component-registry", "heart-core"],
      metadata: {
        source: "system-kernel",
        lastContextRefreshAt: this.lastContextRefreshAt,
        settings: this.getSettingsSummary(),
      },
    })
  }

  private calculateChecksum(settings: MaintenanceSettings): string {
    return createHash("sha256")
      .update(JSON.stringify(settings))
      .digest("hex")
  }

  private applySettingsToContext(settings: MaintenanceSettings, checksum: string) {
    const current = systemModel.getContext()
    const environment = settings.maintenanceMode ? "maintenance" : current.environment ?? "development"

    systemModel.updateContext({
      maintenanceMode: settings.maintenanceMode,
      offlineMode: settings.maintenanceMode,
      environment,
      metadata: {
        ...(current.metadata ?? {}),
        maintenanceAllowlist: settings.allowlist ?? {},
        maintenanceCategories: settings.categories ?? {},
        maintenanceSource: SYSTEM_SETTINGS_SOURCE,
        kernel: {
          refreshedAt: new Date().toISOString(),
          checksum,
        },
      },
    })
  }
}

export const systemKernel = new SystemKernel()
