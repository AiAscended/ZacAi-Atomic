import { z } from "zod"
import { TEMPERATURES } from "../config/hcoConstants"
import type { AgentContext, CodeArtifact } from "../shared/types"

const CodeArtifactSchema = z.object({
  action: z.string().min(3),
  language: z.string().min(2),
  body: z.string().min(10),
  tests: z.array(z.string().min(3)).min(1),
  confidence: z.number().min(0).max(1),
})

export class CodeAgent {
  constructor(private readonly temperature = TEMPERATURES.code) {}

  async execute(ctx: AgentContext): Promise<CodeArtifact> {
    const { state, tools } = ctx
    const hypothesis = state.hypotheses[0]
    const validations = state.validations
    const availableDomains = tools.domainRegistry.getAllDomains()
    const domainSummary = availableDomains.slice(0, 3).map((domain) => domain.displayName).join(", ") || "core orchestrator"

    const action = hypothesis ? `Prototype to validate: ${hypothesis.text}` : "Prototype reference scenario"
    const codeBody = this.composeBody(state.input, domainSummary, validations)
    const tests = this.composeTests(hypothesis?.text)
    const confidence = this.estimateConfidence(ctx, validations.length, hypothesis?.prior ?? 0.4)

    return CodeArtifactSchema.parse({
      action,
      language: "typescript",
      body: codeBody,
      tests,
      confidence,
    })
  }

  private composeBody(input: string, domainSummary: string, validations: AgentContext["state"]["validations"]): string {
    const reasoning = validations.slice(0, 2).map((validation) => `// ${validation.proofType}: ${validation.chain.join(" -> ")}`)

    return [
      "// HCO Code Agent synthesis",
      `// Observed input: ${input.slice(0, 180)}`,
      `// Domains leveraged: ${domainSummary}`,
      ...reasoning,
      "export function runHCOPrototype(signal: string) {",
      "  const normalized = signal.trim().toLowerCase() || 'unknown'",
      "  const ledger = new Map<string, number>()",
      "  ledger.set(normalized, Date.now())",
      "  return {",
      "    signal: normalized,",
      "    ledgerSize: ledger.size,",
      "    timestamp: new Date().toISOString(),",
      "  }",
      "}",
    ].join("\n")
  }

  private composeTests(hypothesisText?: string): string[] {
    const context = hypothesisText ? hypothesisText.slice(0, 60) : "baseline response"
    return [
      `vitest run --reporter verbose --testNamePattern="HCO :: ${context}"`,
    ]
  }

  private estimateConfidence(ctx: AgentContext, validationCount: number, prior: number): number {
    const expression = `${Math.max(1, validationCount)} * 0.05 + ${prior.toFixed(2)}`
    const calculatorResult = ctx.tools.calculator.evaluate(expression).value
    const base = Number.isFinite(calculatorResult) ? calculatorResult : prior
    const adjustment = (this.temperature - TEMPERATURES.code) * 0.05
    return Math.max(0.3, Math.min(0.97, base + adjustment))
  }
}
