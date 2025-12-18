#!/usr/bin/env tsx
import { mainOrchestrator } from "../src/ai/orchestration/main-orchestrator"
import { systemModel, selfHealingEngine } from "../src/ai/core"

async function run() {
  console.log("🫀  ZacAi Heart Core self-test")
  await mainOrchestrator.initialize()

  const response = await mainOrchestrator.processPrompt(
    "Run a ZacAi maintenance-mode self-test. Identify component readiness and call out missing organs.",
    `cli-heart-test-${Date.now()}`,
    { origin: "cli", mode: "maintenance", intent: "self-test" },
  )

  console.log("\n--- Core Response ---")
  console.log(response.text)
  console.log("\nConfidence:", response.confidence.toFixed(2))

  const diagnostics = await selfHealingEngine.runDiagnostics()
  console.log("\n--- Diagnostics ---")
  console.log(`Signals captured: ${diagnostics.signals.length}`)
  if (diagnostics.plan) {
    const planSteps = Object.values(diagnostics.plan.steps)
    const statusCounts = planSteps.reduce<Record<string, number>>((acc, step) => {
      acc[step.status] = (acc[step.status] ?? 0) + 1
      return acc
    }, {})
    console.log("Heart plan status:", statusCounts)
  }

  const snapshot = systemModel.getSnapshot()
  const coreComponents = snapshot.components.filter(component =>
    [
      "heart-core",
      "main-orchestrator",
      "inference-engine",
      "monitoring-center",
      "self-heal-engine",
    ].includes(component.id),
  )

  console.log("\n--- Core Components ---")
  coreComponents.forEach(component => {
    console.log(`${component.id.padEnd(24)} ${component.status.padEnd(8)} ${component.health.summary}`)
  })

  console.log("\nCompleted at", new Date().toISOString())
}

run().catch(error => {
  console.error("Self-test failed", error)
  process.exit(1)
})
