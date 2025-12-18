export interface AtomicFact {
  fact: string
  confidence: number
}

export interface Hypothesis {
  text: string
  prior: number
  type: "wild" | "intuitive"
}

export interface Validation {
  valid: boolean
  proofType: "aristotle" | "modusPonens"
  chain: string[]
}

export interface HCOState {
  input: string
  phase: "induction" | "deduction" | "synthesis"
  atomicFacts: AtomicFact[]
  hypotheses: Hypothesis[]
  validations: Validation[]
  happiness: number
  memory: Record<string, unknown>
}

export interface CodeArtifact {
  plan: string[]
  tests: string[]
  tooling: string[]
}

export interface DebateOutcome {
  thesis: string
  antithesis: string
  synthesis: string
  tension: number
}

export interface EmpathyBalance {
  happiness: number
  advisory: string
}
