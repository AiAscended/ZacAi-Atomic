import { buildToolset } from "./shared/toolSelector"
import { RETRY_BACKOFFS, UCL_HAPPINESS } from "./config/hcoConstants"
import { trajectoryMemory } from "./shared/memory"
import { withRetry } from "./shared/retry"
import type { HCOState, OrchestratorOptions } from "./shared/types"
import { PerceiverAgent } from "./agents/PerceiverAgent"
import { HypothesisAgent } from "./agents/HypothesisAgent"
import { CodeAgent } from "./agents/CodeAgent"
import { LogicAgent } from "./agents/LogicAgent"
import { DebateAgent } from "./agents/DebateAgent"
import { EmpathyAgent } from "./agents/EmpathyAgent"
import { ReflectAgent } from "./agents/ReflectAgent"

export class HCOOrchestrator {
  private readonly tools = buildToolset()
  private readonly perceiver = new PerceiverAgent()
  private readonly hypothesis = new HypothesisAgent()
  private readonly code = new CodeAgent()
  private readonly logic = new LogicAgent()
  private readonly debate = new DebateAgent()
  private readonly empathy = new EmpathyAgent()
  private readonly reflect = new ReflectAgent()

  async execute(input: string, options: OrchestratorOptions = {}): Promise<HCOState> {
    const snapshots = options.userId ? await this.loadSnapshots(options.userId) : []

    let state: HCOState = {
      input,
      phase: "induction",
      atomicFacts: [],
      hypotheses: [],
      validations: [],
      happiness: 0,
      memory: {
        metadata: options.metadata ?? {},
        snapshots,
      },
    }

    const atomicFacts = await withRetry(() => this.perceiver.perceive(input), RETRY_BACKOFFS)
    state = { ...state, atomicFacts }

    const hypotheses = await withRetry(() => this.hypothesis.generate(atomicFacts), RETRY_BACKOFFS)
    state = { ...state, hypotheses }

    const validations = await withRetry(() => this.logic.validate(hypotheses), RETRY_BACKOFFS)
    state = { ...state, validations, phase: "deduction" }

    const codeArtifact = await withRetry(() => this.code.execute({ state, tools: this.tools }), RETRY_BACKOFFS)
    state = { ...state, codeArtifact }

    const debate = await withRetry(() => this.debate.conduct({ state, tools: this.tools }), RETRY_BACKOFFS)
    state = { ...state, debate, phase: "synthesis" }

    const empathy = await withRetry(() => this.empathy.harmonize({ state, tools: this.tools }), RETRY_BACKOFFS)
    state = { ...state, empathy }

    const reflection = await withRetry(() => this.reflect.equilibrate({ state, tools: this.tools }), RETRY_BACKOFFS)
    state = {
      ...state,
      reflection,
      happiness: reflection.happiness ?? UCL_HAPPINESS.rewardCoefficient,
    }

    if (options.userId) {
      await withRetry(() => trajectoryMemory.save(options.userId!, state), RETRY_BACKOFFS)
    }

    return state
  }

  private async loadSnapshots(userId: string) {
    try {
      return await withRetry(() => trajectoryMemory.loadRecent(userId), RETRY_BACKOFFS)
    } catch (error) {
      // Persist failure should not block orchestration; record diagnostic stub in memory payload
      return [
        {
          id: "memory-unavailable",
          userId,
          happiness: 0.5,
          trajectory: { error: (error as Error)?.message ?? "unknown" },
          createdAt: new Date().toISOString(),
        },
      ]
    }
  }
}

export const hcoOrchestrator = new HCOOrchestrator()
