import { z } from "zod"
import { ARISTOTLE_FIGURE_ONE_MOODS, PROPOSITIONAL_RULES, TEMPERATURES } from "../config/hcoConstants"
import type { Hypothesis, Validation } from "../shared/types"

const ValidationSchema: z.ZodType<Validation[]> = z
  .array(
    z.object({
      valid: z.boolean(),
      proofType: z.union([z.literal("aristotle"), z.literal("modusPonens"), z.literal("modusTollens"), z.literal("hypotheticalSyllogism")]),
      chain: z.array(z.string().min(2)).min(1),
      mood: z.string().optional(),
    }),
  )
  .min(1)

export class LogicAgent {
  constructor(private readonly temperature = TEMPERATURES.logic) {}

  async validate(hypotheses: Hypothesis[]): Promise<Validation[]> {
    if (hypotheses.length === 0) {
      return ValidationSchema.parse([
        {
          valid: false,
          proofType: "hypotheticalSyllogism",
          chain: ["No hypotheses provided", "Requesting clarification"],
        },
      ])
    }

    const syllogistic = hypotheses.map((hypothesis, idx) => this.applyFigureOneReasoning(hypothesis, idx))
    const propositional = hypotheses
      .filter((hypothesis) => /if.+then/i.test(hypothesis.text))
      .map((hypothesis, idx) => this.applyPropositionalReasoning(hypothesis, idx))

    return ValidationSchema.parse([...syllogistic, ...propositional])
  }

  private applyFigureOneReasoning(hypothesis: Hypothesis, idx: number): Validation {
    const moods = Object.keys(ARISTOTLE_FIGURE_ONE_MOODS)
    const selectedMood = moods[idx % moods.length]
    const normalized = hypothesis.text.replace(/\s+/g, " ")
    const temperatureBoost = this.temperature - TEMPERATURES.logic

    return {
      valid: normalized.toLowerCase().includes("all ") || temperatureBoost > 0.05,
      proofType: "aristotle",
      mood: selectedMood,
      chain: [
        `Major: ${normalized}`,
        `Minor: ${ARISTOTLE_FIGURE_ONE_MOODS[selectedMood as keyof typeof ARISTOTLE_FIGURE_ONE_MOODS].minor} structure`,
        `Conclusion: ${selectedMood} mood satisfied? ${normalized.includes("therefore") ? "Yes" : "Pending"}`,
      ],
    }
  }

  private applyPropositionalReasoning(hypothesis: Hypothesis, idx: number): Validation {
    const rule = PROPOSITIONAL_RULES[idx % PROPOSITIONAL_RULES.length]
    const baseChain = hypothesis.text.split(/then/i).map((chunk) => chunk.trim())
    const temperatureBoost = this.temperature - TEMPERATURES.logic

    return {
      valid: rule !== "modusTollens" || hypothesis.prior + temperatureBoost > 0.4,
      proofType: rule,
      chain: baseChain,
    }
  }
}
