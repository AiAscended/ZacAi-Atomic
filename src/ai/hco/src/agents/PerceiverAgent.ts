import { z } from "zod"
import { TEMPERATURES } from "../config/hcoConstants"
import type { AtomicFact } from "../shared/types"

const FactSchema = z
  .array(
    z.object({
      fact: z.string().min(3),
      confidence: z.number().min(0).max(1),
    }),
  )
  .min(1)

export class PerceiverAgent {
  constructor(private readonly temperature = TEMPERATURES.perceiver) {}

  async perceive(input: string): Promise<AtomicFact[]> {
    const statements = this.splitStatements(input)
    const facts = statements
      .map((statement, idx) => this.statementToFact(statement, idx))
      .filter((fact): fact is AtomicFact => Boolean(fact))

    if (facts.length === 0) {
      return FactSchema.parse([
        {
          fact: "needs_clarification(input)",
          confidence: 0.4,
        },
      ])
    }

    return FactSchema.parse(facts.slice(0, 12))
  }

  private splitStatements(text: string): string[] {
    return text
      .split(/[.!?\n]/)
      .map((segment) => segment.trim())
      .filter(Boolean)
  }

  private statementToFact(statement: string, idx: number): AtomicFact | null {
    const normalized = statement.replace(/"|'/g, "").trim()
    if (!normalized) return null

    const subjectPredicate = normalized.match(/^(?<subject>[\w\s-]+?)\s+(is|are|remains)\s+(?<predicate>.+)$/i)
    if (subjectPredicate?.groups) {
      const { subject, predicate } = subjectPredicate.groups
      return this.factFromPredicate(subject, predicate, idx)
    }

    const possession = normalized.match(/^(?<subject>[\w\s-]+?)\s+(has|needs|holds)\s+(?<object>.+)$/i)
    if (possession?.groups) {
      const { subject, object } = possession.groups
      const predicate = `${this.sanitize(object)}_available`
      return this.factFromPredicate(subject, predicate, idx)
    }

    const causal = normalized.match(/^(?<cause>.+?)\s+(causes|drives|yields|produces)\s+(?<effect>.+)$/i)
    if (causal?.groups) {
      const { cause, effect } = causal.groups
      return {
        fact: `causes(${this.sanitize(cause)},${this.sanitize(effect)})`,
        confidence: this.confidenceFromIndex(idx),
      }
    }

    const implication = normalized.match(/if\s+(?<antecedent>.+?)\s+then\s+(?<consequent>.+)/i)
    if (implication?.groups) {
      const { antecedent, consequent } = implication.groups
      return {
        fact: `implies(${this.sanitize(antecedent)},${this.sanitize(consequent)})`,
        confidence: this.confidenceFromIndex(idx),
      }
    }

    // Fallback to observational predicate
    return {
      fact: `observed(${this.sanitize(normalized)})`,
      confidence: this.confidenceFromIndex(idx) * 0.9,
    }
  }

  private factFromPredicate(subject: string, predicate: string, idx: number): AtomicFact {
    return {
      fact: `${this.sanitize(predicate)}(${this.sanitize(subject)})`,
      confidence: this.confidenceFromIndex(idx),
    }
  }

  private sanitize(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  }

  private confidenceFromIndex(idx: number): number {
    const base = 0.8 - idx * 0.04
    const temperatureAdjustment = (this.temperature - TEMPERATURES.perceiver) * 0.1
    return Math.max(0.35, Math.min(0.95, base + temperatureAdjustment))
  }
}
