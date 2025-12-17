import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/ai/orchestration/main-orchestrator", () => {
  const processPrompt = vi.fn().mockResolvedValue({
    text: "All systems nominal",
    metadata: {},
    domains: ["system"],
    confidence: 0.97,
  })
  const initialize = vi.fn().mockResolvedValue(undefined)
  return {
    mainOrchestrator: {
      initialize,
      processPrompt,
    },
  }
})

vi.mock("@/ai/core", () => ({
  systemModel: {
    getSnapshot: vi.fn(),
    getPlan: vi.fn(),
  },
  selfHealingEngine: {
    runDiagnostics: vi.fn().mockResolvedValue({
      generatedAt: "2025-01-01T00:00:00.000Z",
      signals: [],
      recommendedActions: [],
    }),
  },
}))

import { executeHeartbeatCommand, HeartbeatRequestError, DEFAULT_HEARTBEAT_PROMPT } from "@/app/api/admin/system/heartbeat/route"
import { mainOrchestrator } from "@/ai/orchestration/main-orchestrator"
import { selfHealingEngine } from "@/ai/core"

const mockedOrchestrator = vi.mocked(mainOrchestrator)
const mockedSelfHeal = vi.mocked(selfHealingEngine)

describe("executeHeartbeatCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("runs the default self-test prompt when requested", async () => {
    const result = await executeHeartbeatCommand({ action: "self-test" })

    expect(result.ok).toBe(true)
    expect(mockedOrchestrator.processPrompt).toHaveBeenCalledWith(
      DEFAULT_HEARTBEAT_PROMPT,
      expect.stringMatching(/^admin-heartbeat-/),
      expect.objectContaining({ intent: "core-self-test", requestType: "self-test" }),
    )
    expect(mockedSelfHeal.runDiagnostics).toHaveBeenCalledTimes(1)
  })

  it("accepts arbitrary maintenance prompts without an action flag", async () => {
    const prompt = "Report kernel readiness state"
    const result = await executeHeartbeatCommand({ prompt })

    expect(result.ok).toBe(true)
    expect(mockedOrchestrator.processPrompt).toHaveBeenCalledWith(
      prompt,
      expect.any(String),
      expect.objectContaining({ intent: "admin-manual-command", requestType: "custom-prompt" }),
    )
  })

  it("rejects requests that lack both action and prompt", async () => {
    await expect(executeHeartbeatCommand({})).rejects.toBeInstanceOf(HeartbeatRequestError)
  })
})
