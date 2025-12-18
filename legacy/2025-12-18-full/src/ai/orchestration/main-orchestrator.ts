import { hcoOrchestrator } from "@hco/mainOrchestrator"
import { ThinkingTracker } from "./thinkingTracker"
import { PromptProcessor } from "../input_processing/promptProcessor"
import { DomainQueryExecutor } from "../inference/domainQueryExecutor"
import { ResponseSynthesizer } from "../output_generation/responseSynthesizer"
import { formatResponse } from "./responseFormatter"
import * as logger from "./logger"
import { getEnabledDomains } from "../knowledge-domains"
import { LLMInferenceEngine } from "../models/unified-transformer-llm/unified-transformer-llm_inference/llm-inferenceEngine"
import { ScientificCalculator } from "../shared/tools/shared-ScientificCalculator"
import { settingsStore } from "../shared/config/settingsStore"
import type { OrchestratorSettings } from "../shared/types/adminSettings"
import { LearningMetricsTracker } from "../monitoring/learningMetricsTracker"
import type { InferenceMetrics } from "../monitoring/learningMetricsTracker"
import { enhancedMetricsCollector } from "../monitoring/enhancedMetricsCollector"
import { getSystemSettings } from "./system/systemSettings"

type MaintenanceSettings = Awaited<ReturnType<typeof getSystemSettings>>
import {
  bootHeart,
  HEART_DOC_PATH,
  markHeartOrganStatus,
  registerHeartCore,
  systemModel,
} from "../core"
import type {
  ComponentHealthStatus,
  HeartPlanStepId,
  HealthSignal,
  PlanEdge,
  PlanGraph,
  PlanStep,
  PlanStepStatus,
  SystemGoal,
} from "../types"

export interface OrchestratorResponse {
  text: string
  metadata: {
    thinkingSteps?: Array<{
      step: string
      description: string
      timestamp: number
      data?: Record<string, unknown>
    }>
    processingTime?: number
    tokensUsed?: number
    modelsInvoked?: string[]
    domainsQueried?: string[]
  }
  domains: string[]
  confidence: number
  sources?: string[]
  contentBlocks?: {
    textBlocks: Array<{ id: string; content: string }>
    codeBlocks: Array<{ id: string; language: string; code: string; filename?: string }>
  }
}

type DomainInferenceResult = { domain: string; result: string; confidence: number }

type PipelineContext = {
  rawPrompt: string
  sessionId: string
  metadata: Record<string, unknown>
  cleanedPrompt?: string
  subtasks?: string[]
  domains?: string[]
  domainResults?: DomainInferenceResult[]
  llmResponse?: string
  llmSuccess?: boolean
  llmError?: Error | null
  enrichedPrompt?: string
  synthesizedText?: string
  synthesizedConfidence?: number
  synthesizedSources?: string[]
}

export class MainOrchestrator {
  private static instance: MainOrchestrator

  private readonly thinkingTracker = new ThinkingTracker()
  private readonly promptProcessor = new PromptProcessor()
  private readonly domainQueryExecutor = new DomainQueryExecutor()
  private readonly responseSynthesizer = new ResponseSynthesizer()
  private readonly learningMetricsTracker = new LearningMetricsTracker()
  private llmInferenceEngine: LLMInferenceEngine | null = null

  private initialized = false
  private config: OrchestratorSettings | null = null
  private availableDomains: string[] = []
  private availableModels: string[] = []
  private systemSettings: MaintenanceSettings | null = null
  private lastSettingsRefresh = 0

  private heartBooted = false
  private readonly heartGoalId = "goal-heart-main-orchestrator"
  private readonly heartPlanVersion = "1.0.0"
  private heartPlanGraph: PlanGraph | null = null
  private readonly heartPlanSteps: HeartPlanStepId[] = [
    "input-processing",
    "domain-routing",
    "domain-inference",
    "llm-inference",
    "response-synthesis",
  ]
  private readonly heartPlanDescriptors: Record<HeartPlanStepId, {
    label: string
    description: string
    executor: PlanStep["executor"]
    targetComponent: string
  }> = {
    "input-processing": {
      label: "Normalize Prompt",
      description: "Clean user input, detect fast-paths, and decompose tasks",
      executor: "internal",
      targetComponent: "main-orchestrator",
    },
    "domain-routing": {
      label: "Select Domains",
      description: "Match normalized prompt to the Heart domain registry",
      executor: "domain",
      targetComponent: "knowledge-domain-registry",
    },
    "domain-inference": {
      label: "Run Domain Engines",
      description: "Execute enabled knowledge domains via unified registry",
      executor: "domain",
      targetComponent: "knowledge-domain-registry",
    },
    "llm-inference": {
      label: "Unified Transformer",
      description: "Run the Unified Transformer LLM against enriched prompts",
      executor: "model",
      targetComponent: "llm-unified-transformer",
    },
    "response-synthesis": {
      label: "Synthesize Response",
      description: "Fuse LLM + domain outputs and format for UI",
      executor: "internal",
      targetComponent: "main-orchestrator",
    },
  }

  private healthSignals: HealthSignal[] = []
  private async refreshSystemSettings(force = false): Promise<void> {
    const now = Date.now()
    if (!force && this.systemSettings && now - this.lastSettingsRefresh < 60_000) {
      return
    }
    this.systemSettings = await getSystemSettings(force)
    this.lastSettingsRefresh = now
  }

  private getMaintenanceMode(): boolean {
    return this.systemSettings?.maintenanceMode ?? true
  }

  public static getInstance(): MainOrchestrator {
    if (!MainOrchestrator.instance) {
      MainOrchestrator.instance = new MainOrchestrator()
    }
    return MainOrchestrator.instance
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    logger.info("Initializing MainOrchestrator...", {})
    await this.refreshSystemSettings(true)
    await this.ensureHeartReady()

    const start = Date.now()
    this.thinkingTracker.addStep("load_config", "Loading orchestrator configuration")
    this.config = await settingsStore.getOrchestrator()

    await this.initializeLLM()
    await this.initializeDomains()
    await this.updateContextAfterInitialization()

    this.initialized = true
    logger.info("MainOrchestrator initialized", {
      durationMs: Date.now() - start,
      domains: this.availableDomains.length,
      models: this.availableModels.length,
    })
  }

  public async processPrompt(
    rawPrompt: string,
    sessionId: string,
    metadata: Record<string, unknown> = {},
  ): Promise<OrchestratorResponse> {
    if (!this.initialized) {
      await this.initialize()
    }

    await this.refreshSystemSettings()
    const pipeline: PipelineContext = { rawPrompt, sessionId, metadata }
    this.thinkingTracker.reset()
    this.resetHeartPlanExecution()

    const mathResponse = this.tryMathFastPath(pipeline)
    if (mathResponse) {
      return mathResponse
    }

    if (this.shouldUseHybridMode(rawPrompt, metadata)) {
      this.skipPlanSteps(this.heartPlanSteps.filter(step => step !== "input-processing"), {
        reason: "hybrid-hco",
      })
      return this.processViaHybridOrchestrator(rawPrompt, sessionId, metadata)
    }

    const processingStart = Date.now()

    try {
      await this.runStage("input-processing", () => this.stageInputProcessing(pipeline))
      await this.runStage("domain-routing", () => this.stageDomainRouting(pipeline))
      await this.runStage("domain-inference", () => this.stageDomainInference(pipeline))
      await this.runStage("llm-inference", () => this.stageLLMInference(pipeline))
      await this.runStage("response-synthesis", () => this.stageResponseSynthesis(pipeline))

      const response: OrchestratorResponse = {
        text: pipeline.synthesizedText ?? pipeline.llmResponse ?? "No response produced",
        metadata: {
          thinkingSteps: this.thinkingTracker.getSteps(),
          processingTime: Date.now() - processingStart,
          modelsInvoked: this.availableModels,
          domainsQueried: pipeline.domains ?? [],
        },
        domains: pipeline.domains ?? [],
        confidence: pipeline.synthesizedConfidence ?? (pipeline.llmSuccess ? 0.85 : 0.5),
        sources: pipeline.synthesizedSources,
        contentBlocks: pipeline.synthesizedText
          ? formatResponse(pipeline.synthesizedText)
          : { textBlocks: [{ id: "text-1", content: pipeline.synthesizedText ?? "" }], codeBlocks: [] },
      }

      await this.recordMetrics(pipeline, response, processingStart)
      return response
    } catch (error) {
      logger.info("Error in prompt processing", { error })
      this.markPlanStep("response-synthesis", "failed", {
        error: error instanceof Error ? error.message : String(error),
      })

      enhancedMetricsCollector.recordInference({
        confidence: 0.1,
        latency: Date.now() - processingStart,
        success: false,
        domain: "general_knowledge",
      })

      return {
        text: `I encountered an error processing your request: ${error}`,
        metadata: {
          thinkingSteps: this.thinkingTracker.getSteps(),
          processingTime: Date.now() - processingStart,
        },
        domains: ["general_knowledge"],
        confidence: 0.1,
        sources: [],
      }
    }
  }

  public getStatus() {
    return {
      initialized: this.initialized,
      domains: this.availableDomains.length,
      models: this.availableModels.length,
      availableDomains: this.availableDomains,
      availableModels: this.availableModels,
    }
  }

  public async flushLearningMetrics(): Promise<void> {
    await this.learningMetricsTracker.flushToDisk()
  }

  public async getLearningStatistics() {
    return this.learningMetricsTracker.getStatistics()
  }

  // #region Stage implementations

  private async stageInputProcessing(ctx: PipelineContext): Promise<void> {
    this.thinkingTracker.addStep("input_processing", "Processing and cleaning user input")

    const cleanedPrompt = this.promptProcessor.process(ctx.rawPrompt)
    const subtasks = await this.promptProcessor.decomposeSubtasks(cleanedPrompt)

    ctx.cleanedPrompt = cleanedPrompt
    ctx.subtasks = subtasks
    this.markPlanStep("input-processing", "completed", {
      subtasks: subtasks.length,
      cleanedLength: cleanedPrompt.length,
    })
  }

  private async stageDomainRouting(ctx: PipelineContext): Promise<void> {
    if (!ctx.cleanedPrompt || !ctx.subtasks) {
      throw new Error("Input processing stage did not produce cleaned prompt")
    }

    this.thinkingTracker.addStep("domain_routing", "Identifying relevant knowledge domains")

    let relevantDomains = this.identifyRelevantDomains(ctx.cleanedPrompt)
    this.markPlanStep("domain-routing", "running", {
      candidateDomains: relevantDomains.length,
    })

    if (relevantDomains.length === 0) {
      relevantDomains = ["general_knowledge"]
    }

    const maxDomains = this.config?.maxDomainsPerQuery ?? 3
    ctx.domains = relevantDomains.slice(0, maxDomains)

    this.markPlanStep("domain-routing", "completed", {
      selectedDomains: ctx.domains,
    })
  }

  private async stageDomainInference(ctx: PipelineContext): Promise<void> {
    if (!ctx.domains || !ctx.subtasks) {
      throw new Error("Domain routing stage did not select domains")
    }

    this.thinkingTracker.addStep("domain_inference", "Querying knowledge domain engines")
    this.markPlanStep("domain-inference", "running", { parallelMode: true })

    ctx.domainResults = await this.queryKnowledgeDomainsParallel(ctx.domains, ctx.subtasks)

    this.markPlanStep("domain-inference", "completed", {
      domainsQueried: ctx.domainResults.length,
    })
  }

  private async stageLLMInference(ctx: PipelineContext): Promise<void> {
    if (!ctx.cleanedPrompt) {
      throw new Error("LLM inference missing cleaned prompt")
    }

    this.thinkingTracker.addStep("llm_inference", "Generating response with LLM")
    this.markPlanStep("llm-inference", "running", {
      engineAvailable: Boolean(this.llmInferenceEngine),
    })

    ctx.enrichedPrompt = this.buildEnrichedPrompt(ctx.cleanedPrompt, ctx.domainResults ?? [])

    try {
      if (!this.llmInferenceEngine) {
        throw new Error("LLM inference engine unavailable")
      }

      ctx.llmResponse = await this.llmInferenceEngine.generate(ctx.enrichedPrompt, 150)
      ctx.llmSuccess = Boolean(ctx.llmResponse && ctx.llmResponse.trim().length > 20)
    } catch (error) {
      ctx.llmError = error as Error
      ctx.llmSuccess = false
    }

    this.markPlanStep(
      "llm-inference",
      ctx.llmSuccess ? "completed" : "failed",
      ctx.llmSuccess
        ? { responsePreview: ctx.llmResponse?.substring(0, 80) }
        : { error: ctx.llmError?.message || "Unknown LLM failure" },
    )
  }

  private async stageResponseSynthesis(ctx: PipelineContext): Promise<void> {
    this.thinkingTracker.addStep("synthesis", "Synthesizing multi-source response")
    this.markPlanStep("response-synthesis", "running", {
      domainOutputs: ctx.domainResults?.length ?? 0,
      llmSuccess: ctx.llmSuccess,
    })

    let synthesizedText = ctx.llmResponse ?? ""
    let confidence = ctx.llmSuccess ? 0.9 : 0.5
    let sources: string[] = ctx.domainResults?.map(result => result.domain) ?? []

    try {
      const synthesized = this.responseSynthesizer.synthesize({
        llmOutput: ctx.llmResponse ?? "",
        domainOutputs: ctx.domainResults ?? [],
        originalPrompt: ctx.cleanedPrompt ?? ctx.rawPrompt,
      })

      synthesizedText = synthesized.text
      confidence = synthesized.confidence
      sources = synthesized.sources ?? sources

      this.markPlanStep("response-synthesis", "completed", {
        textLength: synthesized.text.length,
      })
    } catch (error) {
      synthesizedText = ctx.llmResponse
        ? ctx.llmResponse
        : this.constructDomainFallback(ctx.cleanedPrompt ?? ctx.rawPrompt, ctx.domains ?? [], ctx.domainResults ?? [])

      this.markPlanStep("response-synthesis", "failed", {
        error: error instanceof Error ? error.message : String(error),
      })
    }

    ctx.synthesizedText = synthesizedText
    ctx.synthesizedConfidence = confidence
    ctx.synthesizedSources = sources
  }

  // #endregion

  private async runStage(step: HeartPlanStepId, executor: () => Promise<void>): Promise<void> {
    this.markPlanStep(step, "running")
    await executor()
  }

  private tryMathFastPath(ctx: PipelineContext): OrchestratorResponse | null {
    const mathPattern = /^[\d\s+\-*/().√πe^]+$/
    if (!mathPattern.test(ctx.rawPrompt.trim())) {
      return null
    }

    this.thinkingTracker.addStep("math_detection", "Detected pure mathematical expression")

    try {
      const result = ScientificCalculator.evaluate(ctx.rawPrompt.trim())
      if (!isNaN(result.value)) {
        this.skipPlanSteps(this.heartPlanSteps, { reason: "math-fast-path" })
        return {
          text: `The result is: ${result.value}${result.steps ? "\n\n" + result.steps.join("\n") : ""}`,
          metadata: {
            thinkingSteps: this.thinkingTracker.getSteps(),
            processingTime: 0,
            tokensUsed: 0,
            modelsInvoked: ["scientific-calculator"],
            domainsQueried: ["mathematics"],
          },
          domains: ["mathematics"],
          confidence: 1,
          sources: ["Scientific Calculator"],
          contentBlocks: formatResponse(`The result is: ${result.value}`),
        }
      }
    } catch (error) {
      logger.info("Quick math calculation failed, falling back to pipeline", { error })
    }

    return null
  }

  private async initializeLLM(): Promise<void> {
    this.thinkingTracker.addStep("init_llm", "Initializing Unified Transformer LLM")

    const { vocabularyManager } = await import("../shared/vocabulary/vocabularyManager")
    const vocabSize = vocabularyManager.getVocabSize()

    const llmConfig = {
      modelType: "decoder-only" as const,
      numLayers: 6,
      numHeads: 8,
      hiddenSize: 512,
      embeddingDim: 512,
      hiddenDim: 2048,
      ffnSize: 2048,
      vocabSize,
      maxSequenceLength: 512,
      batchSize: 16,
      learningRate: 0.0001,
      warmupSteps: 1000,
      maxSteps: 50000,
      dropoutRate: 0.1,
      attentionDropout: 0.1,
      padTokenId: 0,
      bosTokenId: 1,
      eosTokenId: 2,
      unkTokenId: 3,
    }

    this.llmInferenceEngine = new LLMInferenceEngine(llmConfig)
    this.availableModels.push("unified-transformer-llm")

    systemModel.registerComponent({
      id: "llm-unified-transformer",
      name: "Unified Transformer LLM",
      kind: "model",
      version: "0.1.0",
      dependencies: [{ id: "heart-core", contract: "core-services" }],
      capabilities: ["text-generation", "system-reasoning"],
      metadata: { vocabSize, config: llmConfig },
    })

    systemModel.markComponentStatus("llm-unified-transformer", "healthy", "Unified LLM initialized")
    this.recordComponentSignal("llm-unified-transformer", "healthy", "LLM ready", { vocabSize })
    markHeartOrganStatus("inference-engine", "healthy", "Unified Transformer online", { vocabSize })
  }

  private async initializeDomains(): Promise<void> {
    this.thinkingTracker.addStep("init_domains", "Loading knowledge domains")

    const manifests = await getEnabledDomains()
    this.availableDomains = manifests.map(manifest => manifest.id)

    systemModel.registerComponent({
      id: "knowledge-domain-registry",
      name: "Knowledge Domain Registry",
      kind: "domain",
      capabilities: this.availableDomains,
      metadata: { enabled: this.availableDomains.length },
    })

    const status: ComponentHealthStatus = this.availableDomains.length > 0 ? "healthy" : "degraded"
    systemModel.markComponentStatus("knowledge-domain-registry", status, `${this.availableDomains.length} domains online`)
    this.recordComponentSignal("knowledge-domain-registry", status, "Domain registry refreshed", {
      total: this.availableDomains.length,
    })
  }

  private async updateContextAfterInitialization(): Promise<void> {
    await this.refreshSystemSettings()
    const maintenanceMode = this.getMaintenanceMode()
    const currentContext = systemModel.getContext()
    systemModel.updateContext({
      maintenanceMode,
      offlineMode: maintenanceMode,
      availableDomains: this.availableDomains,
      availableTools: this.availableModels,
      environment: maintenanceMode ? "maintenance" : "development",
      metadata: {
        ...(currentContext.metadata ?? {}),
        documentation: HEART_DOC_PATH,
        lastInitializedAt: new Date().toISOString(),
        maintenanceAllowlist: this.systemSettings?.allowlist ?? {},
        maintenanceCategories: this.systemSettings?.categories ?? {},
        maintenanceSource: "SYSTEM_SETTINGS.json",
        heartPlanVersion: this.heartPlanVersion,
      },
    })

    this.reportHeartOrganBaseline()
    this.resetHeartPlanExecution()
  }

  private async ensureHeartReady(): Promise<void> {
    if (this.heartBooted) {
      return
    }

    registerHeartCore()
    this.ensureHeartPlanRegistered()
    const report = await bootHeart()
    if (report.blocked) {
      throw new Error("Heart boot sequence blocked; resolve critical boot checks before proceeding")
    }

    this.heartBooted = true
    const maintenanceMode = this.getMaintenanceMode()
    systemModel.updateContext({
      maintenanceMode,
      offlineMode: true,
      availableDomains: [],
      availableTools: [],
      environment: "maintenance",
      metadata: {
        documentation: HEART_DOC_PATH,
        bootReport: report,
      },
    })
    this.recordComponentSignal("heart-core", "healthy", "Heart boot completed")
  }

  private ensureHeartPlanRegistered(): void {
    const existing = systemModel.getPlan(this.heartGoalId)
    if (existing) {
      this.heartPlanGraph = existing
      return
    }

    const now = new Date().toISOString()
    if (!systemModel.listGoals().some(goal => goal.id === this.heartGoalId)) {
      const goal: SystemGoal = {
        id: this.heartGoalId,
        type: "stability",
        objective: "Keep orchestrator pipeline aligned with Heart plan backbone",
        constraints: [
          {
            id: "heart-doc-alignment",
            description: "Heart orchestration must remain compliant with ZacAi Heart Core README",
            type: "compliance",
            value: HEART_DOC_PATH,
          },
        ],
        success: [
          {
            id: "plan-synchronized",
            description: "All Heart steps reach a terminal status per request cycle",
            metric: "heart.plan.steps.completed",
            threshold: this.heartPlanSteps.length,
          },
        ],
        priority: 1,
        createdBy: "main-orchestrator",
        createdAt: now,
        context: { planVersion: this.heartPlanVersion },
      }
      systemModel.createGoal(goal)
    }

    const steps: Record<string, PlanStep> = {}
    const edges: PlanEdge[] = []
    let previous: HeartPlanStepId | null = null

    for (const stepId of this.heartPlanSteps) {
      const descriptor = this.heartPlanDescriptors[stepId]
      steps[stepId] = {
        id: stepId,
        goalId: this.heartGoalId,
        label: descriptor.label,
        description: descriptor.description,
        status: previous ? "pending" : "ready",
        dependencies: previous ? [previous] : [],
        executor: descriptor.executor,
        targetComponent: descriptor.targetComponent,
        createdAt: now,
        updatedAt: now,
      }

      if (previous) {
        edges.push({ from: previous, to: stepId, type: "sequential" })
      }

      previous = stepId
    }

    const plan: PlanGraph = {
      goalId: this.heartGoalId,
      steps,
      edges,
      version: this.heartPlanVersion,
      createdAt: now,
    }

    this.heartPlanGraph = plan
    systemModel.registerPlan(plan)
  }

  private resetHeartPlanExecution(): void {
    if (!this.heartPlanGraph) {
      return
    }

    const now = new Date().toISOString()
    const steps = Object.fromEntries(
      Object.entries(this.heartPlanGraph.steps).map(([id, step]) => [
        id,
        {
          ...step,
          status: step.dependencies.length === 0 ? "ready" : "pending",
          updatedAt: now,
          parameters: undefined,
        },
      ]),
    )

    this.heartPlanGraph = {
      ...this.heartPlanGraph,
      steps,
    }

    systemModel.registerPlan(this.heartPlanGraph)
  }

  private markPlanStep(stepId: HeartPlanStepId, status: PlanStepStatus, parameters?: Record<string, unknown>): void {
    if (!this.heartPlanGraph) {
      return
    }

    const step = this.heartPlanGraph.steps[stepId]
    if (!step) {
      return
    }

    this.heartPlanGraph = {
      ...this.heartPlanGraph,
      steps: {
        ...this.heartPlanGraph.steps,
        [stepId]: {
          ...step,
          status,
          updatedAt: new Date().toISOString(),
          parameters: parameters ? { ...(step.parameters ?? {}), ...parameters } : step.parameters,
        },
      },
    }

    systemModel.registerPlan(this.heartPlanGraph)
  }

  private skipPlanSteps(stepIds: HeartPlanStepId[], metadata?: Record<string, unknown>): void {
    stepIds.forEach(stepId => this.markPlanStep(stepId, "skipped", metadata))
  }

  private recordComponentSignal(
    componentId: string,
    status: ComponentHealthStatus,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    const signal: HealthSignal = {
      componentId,
      status,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    }

    this.healthSignals.push(signal)
    systemModel.recordHealthSignal(signal)
  }

  private reportHeartOrganBaseline(): void {
    const recordedAt = new Date().toISOString()
    const baselines: Array<{ id: string; status: ComponentHealthStatus; summary: string; metadata?: Record<string, unknown> }> = [
      { id: "input-processing", status: "healthy", summary: "Prompt processor online" },
      { id: "orchestration-goal-interpreter", status: "healthy", summary: "Goal interpreter linked" },
      {
        id: "orchestration-planner",
        status: "degraded",
        summary: "Planner refactor pending",
        metadata: { actionRequired: "upgrade-planner" },
      },
      { id: "orchestration-executor", status: "healthy", summary: "Executor pipeline active" },
      {
        id: "orchestration-policy",
        status: "degraded",
        summary: "Policy enforcement pending",
        metadata: { actionRequired: "wire-policy-engine" },
      },
      { id: "response-synthesizer", status: "healthy", summary: "Response synthesizer active" },
      { id: "offline-simulator", status: "healthy", summary: "CLI fallback ready" },
      { id: "monitoring-center", status: "healthy", summary: "Metrics collectors online" },
      { id: "self-heal-engine", status: "healthy", summary: "Self-heal loop running" },
      {
        id: "state-manager",
        status: "degraded",
        summary: "Persistent state pending integration",
        metadata: { actionRequired: "state-sync" },
      },
      {
        id: "tools-registry",
        status: "degraded",
        summary: "Tool registry limited in maintenance",
        metadata: { actionRequired: "register-core-tools" },
      },
    ]

    baselines.forEach(baseline =>
      markHeartOrganStatus(baseline.id, baseline.status, baseline.summary, {
        recordedAt,
        ...(baseline.metadata ?? {}),
      }),
    )
  }

  private identifyRelevantDomains(prompt: string): string[] {
    const lower = prompt.toLowerCase()
    const matches = new Set<string>()

    const domainKeywords: Record<string, string[]> = {
      system: ["time", "date", "system", "config", "environment"],
      english: ["grammar", "spelling", "sentence", "text"],
      mathematics: ["math", "calculate", "equation", "formula"],
      typescript: ["typescript", "ts", "interface", "type"],
      react: ["react", "component", "jsx", "hook"],
      nextjs: ["next.js", "nextjs", "app router"],
      programming: ["code", "javascript", "function", "async"],
      science: ["science", "physics", "chemistry"],
      documentation: ["document", "readme", "guide"],
      general_knowledge: ["tell me", "who are you", "introduce"],
    }

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        matches.add(domain)
      }
    }

    if (matches.size === 0) {
      matches.add("general_knowledge")
    }

    return Array.from(matches)
  }

  private async queryKnowledgeDomainsParallel(domains: string[], subtasks: string[]): Promise<DomainInferenceResult[]> {
    const query = subtasks.join(" ")
    const domainResults = await this.domainQueryExecutor.queryDomainsByName(domains, query)

    return domainResults
      .filter(result => result.confidence > 0.01 && !result.error)
      .map(result => ({
        domain: result.domain,
        result: result.response || "No result",
        confidence: result.confidence,
      }))
  }

  private buildEnrichedPrompt(prompt: string, domainResults: DomainInferenceResult[]): string {
    if (domainResults.length === 0) {
      return prompt
    }

    let enriched = `User Query: ${prompt}\n\nRelevant Knowledge:\n`
    for (const domainResult of domainResults) {
      enriched += `- ${domainResult.domain}: ${domainResult.result}\n`
    }
    enriched += "\nProvide a comprehensive response based on the above information."

    return enriched
  }

  private constructDomainFallback(
    prompt: string,
    domains: string[],
    domainResults: DomainInferenceResult[],
  ): string {
    if (domainResults.length > 0) {
      let response = `Based on analysis from my ${domains.join(", ")} domains:\n\n`
      for (const result of domainResults) {
        response += `**${result.domain}** (${Math.round(result.confidence * 100)}%): ${result.result}\n\n`
      }
      return response
    }

    if (domains.length > 0) {
      return this.explainDomainRouting(prompt, domains, null)
    }

    return this.analyzeSystemState(prompt, null)
  }

  private explainDomainRouting(prompt: string, domains: string[], error: Error | null): string {
    let response = `I understand you're asking about: "${prompt}"\n\n`
    response += `This maps to my **${domains.join(", ")}** knowledge domains, but they did not return confident signals. `

    if (error) {
      response += `I encountered an issue: ${error.message}. `
    }

    response += "I'm keeping the Heart online and ready to retry once the domains refresh."
    return response
  }

  private analyzeSystemState(prompt: string, error: Error | null): string {
    let response = `I could not route the request "${prompt}" to any domain. `
    response += "I'll capture this incident and keep the Heart core available."
    if (error) {
      response += ` Error details: ${error.message}`
    }
    return response
  }

  private async recordMetrics(
    ctx: PipelineContext,
    response: OrchestratorResponse,
    processingStart: number,
  ): Promise<void> {
    const metrics: InferenceMetrics = {
      prompt: ctx.rawPrompt,
      preprocessedPrompt: ctx.cleanedPrompt ?? ctx.rawPrompt,
      response: response.text,
      confidence: response.confidence,
      domains: ctx.domains ?? [],
      modelsUsed: this.availableModels,
      processingTime: Date.now() - processingStart,
      tokensGenerated: response.text.split(" ").length,
      sessionId: ctx.sessionId,
      timestamp: new Date().toISOString(),
    }

    void this.learningMetricsTracker.recordInference(metrics)

    enhancedMetricsCollector.recordInference({
      confidence: response.confidence,
      latency: Date.now() - processingStart,
      success: true,
      domain: ctx.domains?.[0] ?? "general_knowledge",
      model: ctx.llmSuccess ? "unified-transformer-llm" : "domain-inference",
      tokensGenerated: response.text.length,
    })
  }

  private shouldUseHybridMode(prompt: string, metadata: Record<string, unknown>): boolean {
    const mode = (metadata as { mode?: string }).mode
    if (mode === "hybrid" || mode === "hco") {
      return true
    }
    const keywords = ["multi-agent", "hco", "vcflow", "llemur"]
    return keywords.some(keyword => prompt.toLowerCase().includes(keyword))
  }

  private processViaHybridOrchestrator(
    prompt: string,
    sessionId: string,
    metadata: Record<string, unknown>,
  ): OrchestratorResponse {
    const hybridResponse = hcoOrchestrator.processPrompt(prompt, sessionId, metadata)
    return {
      text: hybridResponse.text,
      metadata: {
        thinkingSteps: hybridResponse.metadata?.thinkingSteps ?? [],
        processingTime: hybridResponse.metadata?.processingTime,
        modelsInvoked: hybridResponse.metadata?.modelsInvoked,
        domainsQueried: hybridResponse.metadata?.domainsQueried,
      },
      domains: hybridResponse.domains ?? [],
      confidence: hybridResponse.confidence ?? 0.7,
      sources: hybridResponse.sources ?? [],
      contentBlocks: hybridResponse.contentBlocks,
    }
  }
}

export const mainOrchestrator = MainOrchestrator.getInstance()
