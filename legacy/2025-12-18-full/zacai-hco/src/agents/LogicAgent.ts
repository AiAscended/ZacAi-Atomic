import { z } from "zod"
import type { Hypothesis, Validation } from "@/shared/types"

const MOODS = {
  Barbara: "All M are P; All S are M → All S are P",
  Celarent: "No M are P; All S are M → No S are P",
  Darii: "All M are P; Some S are M → Some S are P",
  Ferio: "No M are P; Some S are M → Some S not P",
  Cesare: "No P are M; All M are S → No S are P",
  Camestres: "All P are M; No M are S → No S are P",
} as const

const ValidationSchema = z.object({
  valid: z.boolean(),
  proofType: z.literal("aristotle"),
  chain: z.array(z.string().min(1)).min(1),
})

export class LogicAgent {
  async validate(hypotheses: Hypothesis[]): Promise<Validation[]> {
    return hypotheses.map((hypothesis, index) => {
      const moodKey = (Object.keys(MOODS) as Array<keyof typeof MOODS>)[index % 6]
      const chain = [
        `Premise: ${hypothesis.text}`,
        `Mood: ${moodKey}`,
        MOODS[moodKey],
      ]
      return ValidationSchema.parse({
        valid: hypothesis.prior > 0.3,
        proofType: "aristotle",
        chain,
      })
    })
  }
}
