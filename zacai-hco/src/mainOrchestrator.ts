import { PerceiverAgent } from "@/agents/PerceiverAgent"
import { HypothesisAgent } from "@/agents/HypothesisAgent"
import { CodeAgent } from "@/agents/CodeAgent"
import { LogicAgent } from "@/agents/LogicAgent"
import { DebateAgent } from "@/agents/DebateAgent"
import { EmpathyAgent } from "@/agents/EmpathyAgent"
import { ReflectAgent } from "@/agents/ReflectAgent"
import { SupabaseMemoryStore } from "@/shared/memory"
import type { HCOState } from "@/shared/types"
import { HCO_PHASES, RETRY_DELAYS_MS } from "@/config/hcoConstants"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class HybridCognitiveOrchestrator {
  private state: HCOState
  private memoryStore: SupabaseMemoryStore

  private perceiver = new PerceiverAgent()
  private hypothesis = new HypothesisAgent()
  private codeAgent = new CodeAgent()
  private logicAgent = new LogicAgent()
  private debateAgent = new DebateAgent()
  private empathyAgent = new EmpathyAgent()
  private reflectAgent = new ReflectAgent()

  constructor(memoryStore = new SupabaseMemoryStore()) {
    this.memoryStore = memoryStore
    this.state = {
      input: "",
      phase: HCO_PHASES.INDUCTION,
      atomicFacts: [],
      hypotheses: [],
      validations: [],
      happiness: 0,
      memory: {},
    }
  }

  async run(input: string): Promise<HCOState> {
    this.state = { ...this.state, input, phase: HCO_PHASES.INDUCTION }

    const factsPromise = this.retryAgent(() => this.perceiver.process(input), "Perceiver")
    const hypothesesPromise = factsPromise.then((facts) => this.retryAgent(() => this.hypothesis.generate(facts), "Hypothesis"))
    const [atomicFacts, hypotheses] = await Promise.all([factsPromise, hypothesesPromise])

    this.state = { ...this.state, atomicFacts, hypotheses }

    this.state = { ...this.state, phase: HCO_PHASES.DEDUCTION }
    const codePromise = this.retryAgent(() => this.codeAgent.execute(hypotheses), "Code")
    const validationsPromise = this.retryAgent(() => this.logicAgent.validate(hypotheses), "Logic")
    const [codeArtifact, validations] = await Promise.all([codePromise, validationsPromise])
    this.state = { ...this.state, validations }

    this.state = { ...this.state, phase: HCO_PHASES.SYNTHESIS }
    const debate = await this.retryAgent(() => this.debateAgent.fuse(hypotheses, codeArtifact, validations), "Debate")
    const empathy = await this.retryAgent(() => this.empathyAgent.balance(debate, validations), "Empathy")
    const reflection = await this.retryAgent(
      () =>
        this.reflectAgent.equilibrate({
          ...this.state,
          happiness: empathy.happiness,
          memory: { ...this.state.memory, advisory: empathy.advisory },
        }),
      "Reflect",
    )

    this.state = { ...reflection }
    await this.memoryStore.recordTrajectory(this.state)
    return this.state
  }

  private async retryAgent<T>(operation: () => Promise<T>, label: string): Promise<T> {
    let attempt = 0
    let lastError: unknown
    while (attempt < RETRY_DELAYS_MS.length) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        await delay(RETRY_DELAYS_MS[attempt])
        attempt += 1
      }
    }
    throw new Error(`${label} agent failed after ${RETRY_DELAYS_MS.length} attempts: ${String(lastError)}`)
  }
}

if (process.argv[1] && process.argv[1].includes("mainOrchestrator")) {
  const orchestrator = new HybridCognitiveOrchestrator()
  orchestrator.run("Socrates demonstrates wisdom under pressure.").then((state) => {
    console.log(JSON.stringify(state, null, 2))
  })
}
