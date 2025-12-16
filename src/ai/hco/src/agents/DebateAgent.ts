import { z } from "zod"
import { TEMPERATURES } from "../config/hcoConstants"
import type { AgentContext, DebateResult, DebateTurn, Hypothesis } from "../shared/types"

const DebateSchema = z.object({
  turns: z.array(
    z.object({
      speaker: z.union([z.literal("thesis"), z.literal("antithesis"), z.literal("synthesis")]),
      text: z.string().min(5),
      confidence: z.number().min(0).max(1),
    }),
  ),
  synthesis: z.object({
    text: z.string().min(5),
    confidence: z.number().min(0).max(1),
  }),
})

export class DebateAgent {
  constructor(private readonly temperature = TEMPERATURES.debate) {}

  async conduct(ctx: AgentContext): Promise<DebateResult> {
    const { state } = ctx
    const [primary, secondary] = state.hypotheses
    const validations = state.validations

    const turns: DebateTurn[] = [
      this.buildThesis(primary),
      this.buildAntithesis(secondary ?? primary, validations),
      this.buildSynthesis(primary, secondary, validations),
    ]

    const synthesis = {
      text: turns[2].text,
      confidence: this.aggregateConfidence(turns),
    }

    return DebateSchema.parse({ turns, synthesis })
  }

  private buildThesis(hypothesis?: Hypothesis): DebateTurn {
    if (!hypothesis) {
      return {
        speaker: "thesis",
        text: "Observation backlog requires articulation before debate.",
        confidence: 0.35,
      }
    }

    return {
      speaker: "thesis",
      text: `Hypothesis grounding: ${hypothesis.text}`,
      confidence: Math.min(0.9, hypothesis.prior + 0.1),
    }
  }

  private buildAntithesis(hypothesis: Hypothesis | undefined, validations: AgentContext["state"]["validations"]): DebateTurn {
    const counter = validations.find((validation) => !validation.valid)
    if (!counter) {
      return {
        speaker: "antithesis",
        text: `No direct rebuttal found; continue probing ${hypothesis?.text ?? "context"}.`,
        confidence: 0.5,
      }
    }

    return {
      speaker: "antithesis",
      text: `Validation gap detected via ${counter.proofType}. Chain: ${counter.chain.join(" -> ")}`,
      confidence: 0.55,
    }
  }

  private buildSynthesis(primary: Hypothesis | undefined, secondary: Hypothesis | undefined, validations: AgentContext["state"]["validations"]): DebateTurn {
    const success = validations.filter((validation) => validation.valid).length
    const denominator = Math.max(1, validations.length)
    const balance = success / denominator
    const hypothesisSummary = [primary?.text, secondary?.text].filter(Boolean).join(" | ") || "baseline"

    return {
      speaker: "synthesis",
      text: `Balance ${Math.round(balance * 100)}% validation confidence; pursue ${hypothesisSummary}.`,
      confidence: Math.min(0.95, balance + this.temperature * 0.1),
    }
  }

  private aggregateConfidence(turns: DebateTurn[]): number {
    const sum = turns.reduce((acc, turn) => acc + turn.confidence, 0)
    return Math.min(0.95, sum / turns.length)
  }
}
