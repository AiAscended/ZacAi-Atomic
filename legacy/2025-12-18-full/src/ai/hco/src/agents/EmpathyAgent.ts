import { z } from "zod"
import { TEMPERATURES } from "../config/hcoConstants"
import type { AgentContext, EmpathyResult } from "../shared/types"

const EmpathySchema = z.object({
  happiness: z.number().min(0).max(2),
  advisory: z.string().min(5),
  perspectives: z.array(
    z.object({
      viewpoint: z.string().min(3),
      weight: z.number().min(0).max(1),
    }),
  ),
})

export class EmpathyAgent {
  constructor(private readonly temperature = TEMPERATURES.empathy) {}

  async harmonize(ctx: AgentContext): Promise<EmpathyResult> {
    const { state } = ctx
    const validationConfidence = this.averageValidationConfidence(state.validations)
    const debateConfidence = state.debate?.synthesis.confidence ?? 0.5
    const historicalHappiness = this.extractHistoricalSignal(state.memory)

    const happiness = this.clamp((validationConfidence + debateConfidence + historicalHappiness + this.temperature * 0.1) / 3)
    const advisory = happiness > 0.65 ? "Maintain tempo; communicate guardrails." : "Throttle scope and gather more signal."

    const perspectives = [
      { viewpoint: "rational", weight: validationConfidence },
      { viewpoint: "dialogic", weight: debateConfidence },
      { viewpoint: "historical", weight: historicalHappiness },
    ]

    return EmpathySchema.parse({ happiness, advisory, perspectives })
  }

  private averageValidationConfidence(validations: AgentContext["state"]["validations"]): number {
    if (validations.length === 0) return 0.4
    const positives = validations.filter((validation) => validation.valid).length
    return positives / validations.length
  }

  private extractHistoricalSignal(memory: Record<string, unknown>): number {
    const snapshots = (memory.snapshots as Array<{ happiness?: number }> | undefined) ?? []
    if (snapshots.length === 0) return 0.5
    const average = snapshots.reduce((acc, snapshot) => acc + (snapshot.happiness ?? 0.5), 0) / snapshots.length
    return this.clamp(average)
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1.5, value))
  }
}
