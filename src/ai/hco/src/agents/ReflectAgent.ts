import { z } from "zod"
import { TEMPERATURES, UCL_HAPPINESS } from "../config/hcoConstants"
import type { AgentContext, ReflectionResult } from "../shared/types"

const ReflectionSchema = z.object({
  decision: z.string().min(5),
  happiness: z.number(),
  nextSteps: z.array(z.string().min(3)).min(1),
  amplifyAgentWeight: z.boolean(),
})

export class ReflectAgent {
  constructor(private readonly temperature = TEMPERATURES.reflect) {}

  async equilibrate(ctx: AgentContext): Promise<ReflectionResult> {
    const empathy = ctx.state.empathy?.happiness ?? 0.5
    const expectation = this.deriveExpectation(ctx.state.memory)
    const happiness = this.calculateUCL(empathy, expectation)
    const amplifyAgentWeight = happiness > UCL_HAPPINESS.amplificationThreshold

    const decision = ctx.state.debate?.synthesis.text ?? "No synthesis available"
    const nextSteps = this.buildNextSteps(ctx, amplifyAgentWeight)

    return ReflectionSchema.parse({ decision, happiness, nextSteps, amplifyAgentWeight })
  }

  private deriveExpectation(memory: Record<string, unknown>): number {
    const target = (memory.snapshots as Array<{ happiness?: number }> | undefined) ?? []
    if (target.length === 0) return 0.6
    const last = target[0]?.happiness ?? 0.6
    return this.clamp(last)
  }

  private calculateUCL(reality: number, expectation: number): number {
    const reward = UCL_HAPPINESS.rewardCoefficient * reality
    const expectationDelta = reality - expectation
    const amplification = UCL_HAPPINESS.expectationCoefficient * expectationDelta
    const adjusted = reward + amplification + this.temperature * 0.05
    return this.clamp(adjusted)
  }

  private buildNextSteps(ctx: AgentContext, amplify: boolean): string[] {
    const synopsis = ctx.state.input.slice(0, 60) || "input"
    const steps = [
      `Archive cycle synopsis: ${synopsis}`,
      "Log reflection decision to Supabase",
      "Notify admin console of synthesized recommendation",
    ]
    if (amplify) {
      steps.push("Boost creative agent weighting for next cycle")
    } else {
      steps.push("Hold creative weighting constant")
    }
    return steps
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(2, value))
  }
}
