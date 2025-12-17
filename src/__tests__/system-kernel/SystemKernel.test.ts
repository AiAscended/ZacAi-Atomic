import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockRegisterHeartCore, mockGetSystemSettings } = vi.hoisted(() => {
  return {
    mockRegisterHeartCore: vi.fn(),
    mockGetSystemSettings: vi.fn(),
  }
})

vi.mock("@/ai/core/boot", () => ({
  registerHeartCore: mockRegisterHeartCore,
}))

vi.mock("@/ai/orchestration/system/systemSettings", () => ({
  getSystemSettings: mockGetSystemSettings,
}))

import { systemKernel } from "@/ai/system-kernel"
import { systemModel } from "@/ai/system-model"

describe("SystemKernel", () => {
  beforeEach(() => {
    systemModel.resetForTesting()
    systemKernel.resetForTesting()
    mockRegisterHeartCore.mockReset()
    mockGetSystemSettings.mockReset()
    mockGetSystemSettings.mockResolvedValue({
      maintenanceMode: true,
      categories: {},
      allowlist: {},
      lastUpdated: new Date().toISOString(),
    })
  })

  it("initializes heart core components and registers kernel", async () => {
    await systemKernel.initialize(true)

    expect(mockRegisterHeartCore).toHaveBeenCalledTimes(1)
    const kernelComponent = systemModel.getComponent("system-kernel")
    expect(kernelComponent).not.toBeNull()
    expect(kernelComponent?.metadata.source).toBe("system-kernel")
  })

  it("refreshes execution context using cached settings when within interval", async () => {
    await systemKernel.refreshContext(true)
    expect(mockGetSystemSettings).toHaveBeenCalledTimes(1)

    await systemKernel.refreshContext()
    expect(mockGetSystemSettings).toHaveBeenCalledTimes(1)
  })

  it("decorates context metadata with kernel sync info", async () => {
    await systemKernel.refreshContext(true)
    const context = systemModel.getContext()

    expect(context.metadata?.maintenanceSource).toBe("SYSTEM_SETTINGS.json")
    expect(context.metadata?.kernel).toMatchObject({ checksum: expect.any(String) })
  })
})
