import { z } from "zod"
import type { CodeArtifact, Hypothesis } from "@/shared/types"
import { ToolSelector } from "@/shared/toolSelector"

const CodeArtifactSchema = z.object({
  plan: z.array(z.string().min(1)),
  tests: z.array(z.string().min(1)),
  tooling: z.array(z.string().min(1)),
})

export class CodeAgent {
  async execute(hypotheses: Hypothesis[]): Promise<CodeArtifact> {
    const retrieval = ToolSelector.pickRetrievalStrategy("hypotheses")
    const plan = hypotheses.map((hyp, index) => `Step ${index + 1}: Operationalize "${hyp.text}"`)
    const tests = hypotheses.map((hyp, index) => `Assert hypothesis_${index + 1} remains ${hyp.type}`)
    const tooling = [`retrieval:${retrieval.strategy}`, "langsmith:trace", "observability:ucl"]

    return CodeArtifactSchema.parse({ plan, tests, tooling })
  }
}
