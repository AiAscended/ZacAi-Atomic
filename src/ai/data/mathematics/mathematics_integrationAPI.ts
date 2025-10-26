import { registerDomain } from '../registry';
import { MATHEMATICS_DOMAIN } from './mathematics_constants';
import { loadMathematicsSeedVocabulary } from './mathematics_vocabularyManager';
import { mathematicsRunInference } from './mathematics_inferenceController';
import { mathematicsRunTrainingEpoch } from './mathematics_trainingController';
import { registerDomainFiles, watchDomainFiles } from '../dataRegistry';

export const mathematicsInit = async () => {
  await loadMathematicsSeedVocabulary();
  registerDomainFiles(MATHEMATICS_DOMAIN, [
    'src/ai/data/mathematics/mathematics_seedVocabulary.json',
    'src/ai/data/mathematics/mathematics_learnedData.json',
    'src/ai/data/mathematics/mathematics_webDocReferences.json',
    'src/ai/data/mathematics/mathematics_trainingWeights.bin',
    'src/ai/data/mathematics/mathematics_pretrained_weights.json',
    'src/ai/data/mathematics/mathematics_tokens.ts',
    'src/ai/data/mathematics/mathematics_tokenMap.ts',
    'src/ai/data/mathematics/mathematics_embeddings.ts',
    'src/ai/data/mathematics/mathematics_tokenizer.ts',
    'src/ai/data/mathematics/mathematics_parser.ts',
  ]);
  try {
    watchDomainFiles(MATHEMATICS_DOMAIN);
  } catch (e) {
    // ignore watch errors
  }

  registerDomain({
    name: MATHEMATICS_DOMAIN,
    version: '0.1',
    initialize: async () => {
      await loadMathematicsSeedVocabulary();
    },
    query: async (input: string) => mathematicsRunInference(input),
    train: async (opts?: Record<string, unknown>) =>
      mathematicsRunTrainingEpoch(opts as { epochs?: number }),
  });
};

void mathematicsInit();
