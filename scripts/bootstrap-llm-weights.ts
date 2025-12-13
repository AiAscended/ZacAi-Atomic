import { buildDefaultLlmConfig } from '../src/ai/models/unified-transformer-llm/unified-transformer-llm_config/buildDefaultLlmConfig'
import { LLMWeightsManager } from '../src/ai/models/unified-transformer-llm/unified-transformer-llm_weights/unified-transformer-llm-weightsManager'
import { vocabularyManager } from '../src/ai/shared/vocabulary/vocabularyManager'

async function main() {
  const vocabSize = vocabularyManager.getEffectiveVocabSize()
  const config = buildDefaultLlmConfig(vocabSize)
  const manager = new LLMWeightsManager()

  console.log('[BootstrapLLM] Generating baseline weights...')
  const weights = manager.initializeWeights(config)
  await manager.saveWeights(weights, 'model_weights.json', {
    type: 'bootstrapped',
    source: 'bootstrap-script',
    setActive: true,
  })
  console.log('[BootstrapLLM] Completed baseline weight generation')
}

main().catch(error => {
  console.error('[BootstrapLLM] Failed to bootstrap weights', error)
  process.exit(1)
})
