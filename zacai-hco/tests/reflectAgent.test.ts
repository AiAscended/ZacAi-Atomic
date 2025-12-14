import { describe, it, expect } from "vitest"
import { ReflectAgent } from "../src/agents/ReflectAgent"
import type { HCOState } from "../src/shared/types"
import type { Toolset } from "../src/shared/toolSelector"

describe("ReflectAgent", () => {
  it("applies the UCL-inspired happiness calculation", async () => {
    const agent = new ReflectAgent()
    const tools = {
      calculator: {} as Toolset["calculator"],
      urlLookup: {} as Toolset["urlLookup"],
      domainRegistry: {
        getAllDomains: () => [],
      } as Toolset["domainRegistry"],
    }

    const state: HCOState = {
      input: "Customers request trustworthy orchestration",
      phase: "synthesis",
      atomicFacts: [],
      hypotheses: [],
      validations: [],
      debate: {
        turns: [
          { speaker: "thesis", text: "Test", confidence: 0.6 },
          { speaker: "antithesis", text: "Probe", confidence: 0.5 },
          { speaker: "synthesis", text: "Blend", confidence: 0.7 },
        ],
        synthesis: { text: "Blend", confidence: 0.7 },
      },
      empathy: {
        happiness: 0.72,
        advisory: "Maintain tempo",
        perspectives: [
          { viewpoint: "rational", weight: 0.7 },
          { viewpoint: "dialogic", weight: 0.6 },
        ],
      },
      happiness: 0.7,
      memory: { snapshots: [{ happiness: 0.65 }] },
    }

    const reflection = await agent.equilibrate({ state, tools })
    expect(reflection.happiness).toBeGreaterThan(0)
    expect(reflection.nextSteps.length).toBeGreaterThanOrEqual(3)
    expect(typeof reflection.decision).toBe("string")
  })
})
