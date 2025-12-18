import { RunnableSequence } from "@langchain/core/runnables"
import { z } from "zod"
import type { AtomicFact } from "@/shared/types"
import { ToolSelector } from "@/shared/toolSelector"

const AtomicFactSchema = z.object({
  fact: z.string().min(1),
  confidence: z.number().min(0).max(1),
})

export class PerceiverAgent {
  private perceiverChain = RunnableSequence.from<Promise<AtomicFact[]>>([
    async (input: string) => {
      const embeddingTool = ToolSelector.pickEmbeddingTool(input.length)
      const sentences = input
        .replace(/\s+/g, " ")
        .split(/[.!?]/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
      if (!sentences.length) {
        sentences.push(input.trim())
      }
      return sentences.map<AtomicFact>((sentence, index) => ({
        fact: sentence.toLowerCase().replace(/[^a-z0-9_()\s]/g, ""),
        confidence: Math.min(1, embeddingTool.dimensionality / 2048 - index * 0.05),
      }))
    },
    async (facts) => facts.map((fact) => AtomicFactSchema.parse(fact)),
  ])

  async process(input: string): Promise<AtomicFact[]> {
    return this.perceiverChain.invoke(input)
  }
}
