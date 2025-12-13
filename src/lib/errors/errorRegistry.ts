import registryModule from "./errorRegistry.cjs"
import type { AutoResolveConfig, ListErrorsOptions, RecordErrorPayload, SystemErrorRecord } from "./types"

type ErrorRegistryModule = {
  listErrors: (options?: ListErrorsOptions) => SystemErrorRecord[]
  getAllErrors: () => SystemErrorRecord[]
  findErrorById: (id: string) => SystemErrorRecord | null
  recordError: (payload: RecordErrorPayload) => SystemErrorRecord
  markResolving: (id: string, options?: Record<string, unknown>) => SystemErrorRecord | null
  completeResolution: (
    id: string,
    result: {
      success: boolean
      message?: string
      githubBackupBranch?: string
      actor?: "system" | "admin" | "zacai"
      metadata?: Record<string, unknown>
    }
  ) => SystemErrorRecord | null
  markManualResolution: (id: string, note?: string) => SystemErrorRecord | null
  syncFromActivityLog: (limit?: number) => { created: number; lastActivityTimestamp: string | null }
  getAutoResolveConfig: () => AutoResolveConfig
}

const registry = registryModule as ErrorRegistryModule

export function listErrors(options?: ListErrorsOptions): SystemErrorRecord[] {
  return registry.listErrors(options)
}

export function findErrorById(id: string): SystemErrorRecord | null {
  return registry.findErrorById(id)
}

export function recordError(payload: RecordErrorPayload): SystemErrorRecord {
  return registry.recordError(payload)
}

export function markResolving(id: string, options?: Record<string, unknown>): SystemErrorRecord | null {
  return registry.markResolving(id, options)
}

export function completeResolution(
  id: string,
  result: {
    success: boolean
    message?: string
    githubBackupBranch?: string
    actor?: "system" | "admin" | "zacai"
    metadata?: Record<string, unknown>
  }
): SystemErrorRecord | null {
  return registry.completeResolution(id, result)
}

export function markManualResolution(id: string, note?: string): SystemErrorRecord | null {
  return registry.markManualResolution(id, note)
}

export function syncFromActivityLog(limit = 200): { created: number; lastActivityTimestamp: string | null } {
  return registry.syncFromActivityLog(limit)
}

export function getAutoResolveConfig(): {
  autoResolveErrors: boolean
  errorRecoveryStrategy: "self-heal" | "rollback"
  maxAutoResolveAttempts: number
} {
  return registry.getAutoResolveConfig()
}
