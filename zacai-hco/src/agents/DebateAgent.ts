import { z } from "zod"
import type { DebateOutcome, Hypothesis, Validation, CodeArtifact } from "@/shared/types"

const DebateSchema = z.object({
  thesis: z.string().min(1),
  antithesis: z.string().min(1),
  synthesis: z.string().min(1),
  tension: z.number().min(0).max(1),
})

export class DebateAgent {
  async fuse(hypotheses: Hypothesis[], code: CodeArtifact, validations: Validation[]): Promise<DebateOutcome> {
    const thesis = hypotheses[0]?.text ?? "Insufficient data"
    const antithesis = hypotheses[1]?.text ?? thesis
    const synthesis = `Execute ${code.plan[0] ?? "stabilize system"} while honoring ${validations[0]?.chain[0] ?? "axioms"}.`
    const tension = Math.max(0, Math.min(1, Math.abs((hypotheses[0]?.prior ?? 0.5) - (hypotheses[1]?.prior ?? 0.5))))

    return DebateSchema.parse({ thesis, antithesis, synthesis, tension })
  }
}
