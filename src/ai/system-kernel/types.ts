import type { ExecutionContext } from "../types"

export type KernelStatus = "cold" | "initializing" | "ready" | "error"

export interface KernelOptions {
  /** Minimum time between context refreshes unless forced */
  minSettingsRefreshMs?: number
}

export interface KernelHealthSnapshot {
  status: KernelStatus
  initialized: boolean
  maintenanceMode: boolean
  lastContextRefreshAt: string | null
  lastSettingsChecksum: string | null
  registeredComponents: number
  context: ExecutionContext
}
