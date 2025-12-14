import { describe, it, expect } from "vitest"
import { LogicAgent } from "../src/agents/LogicAgent"

describe("LogicAgent", () => {
  it("derives syllogistic and propositional validations", async () => {
    const agent = new LogicAgent()
    const hypotheses = [
      { text: "All strategists are systems thinkers therefore we trust escalations", prior: 0.7, type: "intuitive" },
      { text: "If guardrails tighten then risk exposure contracts", prior: 0.6, type: "wild" },
    ]

    const validations = await agent.validate(hypotheses)

    const syllogisms = validations.filter((validation) => validation.proofType === "aristotle")
    const propositional = validations.filter((validation) => validation.proofType !== "aristotle")

    expect(syllogisms.length).toBe(2)
    expect(propositional.length).toBeGreaterThan(0)
    expect(syllogisms[0]?.chain[0]).toContain("Major")
  })
})
