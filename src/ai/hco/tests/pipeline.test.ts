import { describe, it, expect } from "vitest"
import { hcoOrchestrator } from "../src/mainOrchestrator"

describe("HCO pipeline phase 2", () => {
  it("walks through all phases and produces artifacts", async () => {
    const result = await hcoOrchestrator.execute("If customers trust the agent then adoption accelerates.")

    expect(result.phase).toBe("synthesis")
    expect(result.atomicFacts.length).toBeGreaterThan(0)
    expect(result.hypotheses.length).toBeGreaterThan(0)
    expect(result.validations.length).toBeGreaterThan(0)
    expect(result.codeArtifact).toBeDefined()
    expect(result.debate?.turns.length).toBe(3)
    expect(result.empathy?.happiness).toBeGreaterThan(0)
    expect(result.reflection?.decision).toBeDefined()
    expect(result.happiness).toBe(result.reflection?.happiness)
  })
})
