import { mainOrchestrator } from "@/ai/orchestration/mainOrchestrator"

async function run() {
  try {
    console.log("🚀 Starting prompt pipeline diagnostic...")
    const orchestrator = mainOrchestrator

    console.log("🔧 Initializing orchestrator components...")
    await orchestrator.initialize()

    const prompt = "Summarize the current ZacAi orchestration pipeline status and readiness."
    console.log("🧠 Sending prompt:", prompt)

    const response = await orchestrator.processPrompt(prompt, "diagnostic-session")

    console.log("\n✅ Prompt pipeline responded successfully")
    console.log("Response snippet:", response.text.slice(0, 200))
    console.log("Domains queried:", response.domains)
    console.log("Confidence:", response.confidence.toFixed(2))
    if (response.metadata.tokenUsage) {
      console.log("Token usage:", response.metadata.tokenUsage)
    }

    console.log("💾 Flushing learning metrics to disk for self-learning pipeline validation...")
    await orchestrator.flushLearningMetrics()
    const learningStats = await orchestrator.getLearningStatistics()
    console.log("Learning statistics:", learningStats)

    console.log("✅ Prompt/response pipeline and learning metrics tracker are operational.")
  } catch (error) {
    console.error("❌ Prompt pipeline diagnostic failed:", error)
    process.exitCode = 1
  }
}

run()
