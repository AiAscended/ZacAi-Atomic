import { z } from "zod"
import type { EmpathyBalance, Validation } from "@/shared/types"
import { HAPPINESS_REALITY_COEFFICIENT, HAPPINESS_EXPECTATION_COEFFICIENT } from "@/config/hcoConstants"

const EmpathySchema = z.object({
  happiness: z.number(),
  advisory: z.string().min(1),
})

export class EmpathyAgent {
  async balance(debateOutcome: { tension: number }, validations: Validation[]): Promise<EmpathyBalance> {
    const reality = 1 - debateOutcome.tension
    const expectation = validations.filter((validation) => validation.valid).length / Math.max(1, validations.length)
    const happiness = HAPPINESS_REALITY_COEFFICIENT * reality + HAPPINESS_EXPECTATION_COEFFICIENT * (reality - expectation)
    const advisory = happiness > 0 ? "Maintain collaborative cadence." : "Revisit premises with more context."
    return EmpathySchema.parse({ happiness, advisory })
  }
}
