import { z } from "zod"
import type { AtomicFact, Hypothesis } from "@/shared/types"
import { ToolSelector } from "@/shared/toolSelector"

const HypothesisSchema = z.object({
  text: z.string().min(3),
  prior: z.number().min(0).max(1),
  type: z.enum(["wild", "intuitive"]),
})

export class HypothesisAgent {
  async generate(facts: AtomicFact[]): Promise<Hypothesis[]> {
    const baseline = facts.length ? Math.min(1, facts[0].confidence + 0.2) : 0.5
    const reasoning = ToolSelector.pickReasoningStyle(baseline)
    const templates = [
      (fact?: AtomicFact) => `If ${fact?.fact ?? "the context"} holds, emergent behavior escalates.`,
      (fact?: AtomicFact) => `Stability requires counter-balancing ${fact?.fact ?? "latent pressure"}.`,
      (fact?: AtomicFact) => `Introduce cooperative agents so ${fact?.fact ?? "input"} resolves safely.`,
    ]

    return templates.map((builder, index) =>
      HypothesisSchema.parse({
        text: builder(facts[index]),
        prior: Math.min(1, baseline - index * 0.1 + reasoning.temperature * 0.2),
        type: index === 0 ? "wild" : "intuitive",
      }),
    )
  }
}
