import { z } from "zod"
import { TEMPERATURES } from "../config/hcoConstants"
import type { AtomicFact, Hypothesis, HypothesisType } from "../shared/types"

const HypothesisSchema = z
  .array(
    z.object({
      text: z.string().min(6),
      prior: z.number().min(0).max(1),
      type: z.union([z.literal("wild"), z.literal("intuitive")]),
    }),
  )
  .min(1)

export class HypothesisAgent {
  constructor(private readonly temperature = TEMPERATURES.hypothesis) {}

  async generate(facts: AtomicFact[]): Promise<Hypothesis[]> {
    const anchors: AtomicFact[] = facts.length > 0 ? facts.slice(0, 4) : [{ fact: "observed(system_needs_signal)", confidence: 0.4 }]
    const outputs = anchors.map((fact, idx) => this.factToHypothesis(fact, idx, anchors))
    return HypothesisSchema.parse(outputs)
  }

  private factToHypothesis(fact: AtomicFact, idx: number, anchors: AtomicFact[]): Hypothesis {
    const type: HypothesisType = idx % 2 === 0 ? "intuitive" : "wild"
    const target = anchors[(idx + 1) % anchors.length]?.fact ?? fact.fact

    const relation = this.buildRelation(fact.fact, target)
    const diversityBoost = type === "wild" ? 0.1 : 0
    const prior = this.normalizePrior(fact.confidence - idx * 0.05 + diversityBoost)

    return {
      text: relation,
      prior,
      type,
    }
  }

  private buildRelation(source: string, target: string): string {
    if (source.startsWith("implies") && target.startsWith("observed")) {
      return `If ${this.clean(source)} then reinforcing evidence will surface when ${this.clean(target)}`
    }
    if (source.startsWith("causes")) {
      return `${this.clean(source)} therefore ${this.clean(target)} must be monitored`
    }
    return `${this.clean(source)} suggests we test ${this.clean(target)}`
  }

  private clean(text: string): string {
    return text.replace(/[()_]/g, " ").replace(/\s+/g, " ").trim()
  }

  private normalizePrior(value: number): number {
    const jitter = (this.temperature - TEMPERATURES.hypothesis) * 0.05
    return Math.max(0.2, Math.min(0.95, value + jitter))
  }
}
