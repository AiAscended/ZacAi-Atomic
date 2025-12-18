import { z } from "zod"

const EmbeddingSchema = z.object({
  provider: z.enum(["openai", "supabase"]),
  dimensionality: z.number().int().positive(),
})

const RetrievalSchema = z.object({
  strategy: z.enum(["vector", "keyword", "hybrid"]),
  breadth: z.number().min(1).max(5),
})

const ReasoningSchema = z.object({
  style: z.enum(["analytical", "creative", "balanced"]),
  temperature: z.number().min(0).max(1),
})

export class ToolSelector {
  private constructor() {}

  static pickEmbeddingTool(inputLength: number) {
    const config = {
      provider: inputLength > 280 ? "supabase" : "openai",
      dimensionality: inputLength > 500 ? 1536 : 768,
    }
    return EmbeddingSchema.parse(config)
  }

  static pickRetrievalStrategy(signal: "facts" | "hypotheses" | "validations") {
    const config = {
      strategy: signal === "facts" ? "keyword" : signal === "hypotheses" ? "hybrid" : "vector",
      breadth: signal === "validations" ? 1 : 3,
    }
    return RetrievalSchema.parse(config)
  }

  static pickReasoningStyle(risk: number) {
    const config = {
      style: risk > 0.6 ? "analytical" : risk < 0.3 ? "creative" : "balanced",
      temperature: Math.min(1, Math.max(0, risk)),
    }
    return ReasoningSchema.parse(config)
  }
}
