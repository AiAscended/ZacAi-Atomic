import type { Toolset } from "./toolSelector"

export type Phase = "induction" | "deduction" | "synthesis"

export interface AtomicFact {
  fact: string // e.g., "wise(socrates)"
  confidence: number // 0..1
}

export type HypothesisType = "wild" | "intuitive"

export interface Hypothesis {
  text: string
  prior: number
  type: HypothesisType
}

export type ProofType = "aristotle" | "modusPonens" | "modusTollens" | "hypotheticalSyllogism"

export interface Validation {
  valid: boolean
  proofType: ProofType
  chain: string[]
  mood?: string
}

export interface CodeArtifact {
  action: string
  language: string
  body: string
  tests: string[]
  confidence: number
}

export interface DebateTurn {
  speaker: "thesis" | "antithesis" | "synthesis"
  text: string
  confidence: number
}

export interface DebateResult {
  turns: DebateTurn[]
  synthesis: { text: string; confidence: number }
}

export interface EmpathyResult {
  happiness: number
  advisory: string
  perspectives: Array<{ viewpoint: string; weight: number }>
}

export interface ReflectionResult {
  decision: string
  happiness: number
  nextSteps: string[]
  amplifyAgentWeight: boolean
}

export interface MemorySnapshot {
  id: string
  userId: string
  trajectory: unknown
  happiness: number
  createdAt: string
}

export interface HCOState {
  input: string
  phase: Phase
  atomicFacts: AtomicFact[]
  hypotheses: Hypothesis[]
  validations: Validation[]
  codeArtifact?: CodeArtifact
  debate?: DebateResult
  empathy?: EmpathyResult
  reflection?: ReflectionResult
  happiness: number
  memory: Record<string, unknown>
}

export interface AgentContext {
  state: HCOState
  tools: Toolset
}

export interface OrchestratorOptions {
  userId?: string
  metadata?: Record<string, unknown>
}
