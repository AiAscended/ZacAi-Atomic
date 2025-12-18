# Training & Continuous Learning

**Automated Training Coordinator** | Weight Updates | Feedback Loop Completion

> Orchestrates the complete training cycle: exports high-quality metrics, trains models, updates weights, and triggers automatic retraining when sufficient data is available.

---

## 🎯 Overview

The training system **closes the learning loop**:

✅ **Automatic Training** - Triggers when 50+ quality samples available  
✅ **Data Preparation** - Converts metrics → training pairs (input/target)  
✅ **Weight Management** - Saves/loads/checkpoints via LLMWeightsManager  
✅ **Quality Filtering** - Only trains on confident samples (≥0.7)  
✅ **Scheduled Retraining** - Periodic checks for new training data  

---

## 🏗️ Architecture

```
Continuous Learning Cycle
    ↓
┌────────────────────────────────────────┐
│  LearningMetricsTracker                │
│  • 50+ high-quality samples collected  │
└────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────┐
│  TrainingCoordinator                   │
│  1. Export training data (minConf 0.7) │
│  2. Prepare input/target pairs         │
│  3. Simulate training (TODO: real BP)  │
│  4. Save updated weights                │
│  5. Mark samples as learned             │
└────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────┐
│  LLMWeightsManager                     │
│  • Save checkpoint with metadata       │
│  • Load weights into inference engine  │
└────────────────────────────────────────┘
    ↓
Improved Model Performance
```

---

## 📁 Module Structure

```
training/
├── trainingCoordinator.ts       # ⭐ TRAINING ORCHESTRATION
└── README.md
```

**Dependencies**:
- `monitoring/learningMetricsTracker.ts` - Source of training data
- `models/unified-transformer-llm/llm-weights/llm-weightsManager.ts` - Weight persistence

---

## 🚀 Usage

### Manual Training

```typescript
import { TrainingCoordinator } from '@/ai/training/trainingCoordinator';

const coordinator = new TrainingCoordinator();

// Train with custom config
const result = await coordinator.trainFromMetrics({
  minConfidence: 0.7,           // Only train on confident samples
  maxSamplesPerBatch: 100,      // Limit batch size
  learningRate: 0.0001,         // Small LR for fine-tuning
  epochs: 1,                    // Single pass (online learning)
  modelName: 'unified-transformer-llm',
});

console.log(result);
// {
//   success: true,
//   samplesUsed: 73,
//   epochsCompleted: 1,
//   finalLoss: 0.234,
//   checkpointPath: 'data/weights/checkpoint_epoch_1.json',
//   trainingTime: 12345ms
// }
```

### Check Training Status

```typescript
// Can we train right now?
const canTrain = await coordinator.canTrain({
  minSamples: 50,
  minConfidence: 0.7,
});

console.log(canTrain);
// {
//   canTrain: true,
//   availableSamples: 73,
//   reason: 'Sufficient training data available'
// }

// OR
// {
//   canTrain: false,
//   availableSamples: 23,
//   reason: 'Need at least 50 samples (have 23)'
// }
```

### Automatic Retraining

```typescript
// Schedule automatic training checks
coordinator.scheduleAutoTraining(
  5 * 60 * 1000,  // Check every 5 minutes
  {
    minSamples: 50,
    minConfidence: 0.75,
    maxSamplesPerBatch: 100,
  }
);

// Training will automatically trigger when:
// 1. 50+ unlearned samples exist
// 2. Samples have confidence ≥ 0.75
// 3. No training currently in progress
```

---

## 🔬 Training Process

### Step 1: Export Training Data

```typescript
// Get high-quality unlearned samples
const trainingData = await metricsTracker.exportForTraining({
  minConfidence: config.minConfidence,  // 0.7
  maxSamples: config.maxSamplesPerBatch, // 100
  requireFeedback: false,
});

// trainingData = [
//   {
//     input: "Explain TypeScript generics",
//     target: "Generics in TypeScript allow...",
//     confidence: 0.88,
//     metadata: { id, domains, processingTime }
//   },
//   ...
// ]
```

### Step 2: Prepare Training Pairs

```typescript
const { inputs, targets } = this.prepareTrainingData(trainingData);

// inputs: string[] = ["Explain TypeScript generics", ...]
// targets: string[] = ["Generics in TypeScript allow...", ...]

// Convert to token IDs via tokenizer
const tokenizedInputs = inputs.map(text => tokenizer.encode(text));
const tokenizedTargets = targets.map(text => tokenizer.encode(text));
```

### Step 3: Training Loop (Simulated)

```typescript
// TODO: Implement real backpropagation
// Current: Placeholder simulation

for (let epoch = 0; epoch < config.epochs; epoch++) {
  let epochLoss = 0;
  
  for (let i = 0; i < inputs.length; i++) {
    // Forward pass (simulated)
    const prediction = model.forward(tokenizedInputs[i]);
    
    // Calculate loss (simulated)
    const loss = calculateLoss(prediction, tokenizedTargets[i]);
    epochLoss += loss;
    
    // Backward pass (TODO)
    // const gradients = calculateGradients(loss);
    // model.updateWeights(gradients, learningRate);
  }
  
  console.log(`Epoch ${epoch + 1}: Loss = ${epochLoss / inputs.length}`);
}
```

### Step 4: Save Checkpoint

```typescript
await weightsManager.saveCheckpoint(
  epoch,
  {
    loss: finalLoss,
    samplesUsed: trainingData.length,
    confidence: avgConfidence,
    timestamp: new Date().toISOString(),
  }
);

// Saves to: data/weights/checkpoint_epoch_1_<timestamp>.json
```

### Step 5: Mark as Learned

```typescript
// Prevent retraining on same data
const sampleIds = trainingData.map(d => d.metadata?.id).filter(Boolean);
await metricsTracker.markAsLearned(sampleIds);

// Sets learnedFrom = true in learnt.json
```

---

## 🧩 Configuration

### TrainingConfig

```typescript
interface TrainingConfig {
  minConfidence?: number;        // Default: 0.7
  maxSamplesPerBatch?: number;   // Default: 100
  learningRate?: number;         // Default: 0.0001
  epochs?: number;               // Default: 1 (online learning)
  modelName?: string;            // Default: 'unified-transformer-llm'
  batchSize?: number;            // TODO: Implement batching
  validationSplit?: number;      // TODO: Implement validation
}
```

### Default Configuration

```typescript
const DEFAULT_CONFIG: TrainingConfig = {
  minConfidence: 0.7,           // Train on fairly confident samples
  maxSamplesPerBatch: 100,      // Reasonable batch size
  learningRate: 0.0001,         // Small LR for fine-tuning
  epochs: 1,                    // Single pass (incremental learning)
  modelName: 'unified-transformer-llm',
};
```

### Auto-Training Threshold

```typescript
// Trigger automatic training when:
const MIN_SAMPLES_FOR_TRAINING = 50;

// Adjust based on domain/use case:
// - High-volume domains: 100+ samples
// - Critical domains: 20+ samples with high confidence (0.9+)
// - General use: 50 samples (default)
```

---

## 📊 Training Result

```typescript
interface TrainingResult {
  success: boolean;
  samplesUsed: number;
  epochsCompleted: number;
  finalLoss: number;
  checkpointPath?: string;
  trainingTime: number;         // Milliseconds
  error?: string;               // If success = false
}
```

### Example Result

```json
{
  "success": true,
  "samplesUsed": 73,
  "epochsCompleted": 1,
  "finalLoss": 0.234,
  "checkpointPath": "data/weights/checkpoint_epoch_1_20240115.json",
  "trainingTime": 12345
}
```

---

## 🧪 Testing

```typescript
describe('TrainingCoordinator', () => {
  it('should train from metrics', async () => {
    // Ensure 50+ samples exist
    await seedMetrics(60);
    
    const result = await coordinator.trainFromMetrics({
      minConfidence: 0.7,
      maxSamplesPerBatch: 50,
    });
    
    expect(result.success).toBe(true);
    expect(result.samplesUsed).toBeGreaterThanOrEqual(50);
  });
  
  it('should not train with insufficient data', async () => {
    await clearMetrics();
    await seedMetrics(10);
    
    const canTrain = await coordinator.canTrain({ minSamples: 50 });
    expect(canTrain.canTrain).toBe(false);
  });
  
  it('should schedule automatic training', async () => {
    coordinator.scheduleAutoTraining(1000, {
      minSamples: 10,
    });
    
    // Wait for training cycle
    await sleep(2000);
    
    // Check if training occurred
    const stats = await metricsTracker.getStatistics();
    expect(stats.unlearnedSamples).toBeLessThan(10);
  });
});
```

---

## 📈 Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Training Time** | 10-30s | Per 100 samples (simulated) |
| **Memory Usage** | ~500MB | Model weights + gradients |
| **Checkpoint Size** | ~450MB | Full model weights |
| **Auto-Check Interval** | 5 minutes | Configurable |
| **Min Samples** | 50 | Default threshold |

---

## 🛠️ Maintenance

### Monitor Training

```typescript
// Log training metrics
coordinator.on('training:start', (config) => {
  console.log('Training started:', config);
});

coordinator.on('training:complete', (result) => {
  console.log('Training complete:', result);
  
  // Send alert/notification
  notifyAdmin(`Training complete: ${result.samplesUsed} samples, loss ${result.finalLoss}`);
});
```

### Checkpoint Management

```typescript
// List checkpoints
const checkpoints = fs.readdirSync('data/weights')
  .filter(f => f.startsWith('checkpoint_'))
  .sort();

console.log('Available checkpoints:', checkpoints);

// Load specific checkpoint
await weightsManager.loadCheckpoint(checkpoints[checkpoints.length - 1]);

// Cleanup old checkpoints (keep last 5)
await weightsManager.cleanupCheckpoints(5);
```

### Validate Training Quality

```typescript
// After training, test on validation set
const validationSamples = await metricsTracker.exportForTraining({
  minConfidence: 0.8,
  maxSamples: 20,
});

let correctPredictions = 0;
for (const sample of validationSamples) {
  const prediction = await model.generate(sample.input);
  if (similarity(prediction, sample.target) > 0.8) {
    correctPredictions++;
  }
}

const accuracy = correctPredictions / validationSamples.length;
console.log(`Validation accuracy: ${accuracy * 100}%`);
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Training not triggering | Check `canTrain()`, ensure 50+ unlearned samples |
| Out of memory | Reduce `maxSamplesPerBatch`, train in smaller batches |
| Loss not decreasing | TODO: Implement real backprop (currently simulated) |
| Checkpoints too large | Implement weight quantization, pruning |
| Training too slow | TODO: Add GPU support, optimize matmul |

---

## 🔗 Integration Points

### With LearningMetricsTracker

```typescript
// Export unlearned samples
const trainingData = await metricsTracker.exportForTraining(config);

// Mark samples as used
await metricsTracker.markAsLearned(sampleIds);
```

### With LLMWeightsManager

```typescript
// Save checkpoint after training
await weightsManager.saveCheckpoint(epoch, metrics);

// Load weights into inference engine
const weights = weightsManager.getWeights();
const engine = new LLMInferenceEngine(config, weights);
```

### With API Routes

```typescript
// app/api/training/route.ts

export async function POST(req: Request) {
  const { action, config } = await req.json();
  
  if (action === 'train') {
    const result = await coordinator.trainFromMetrics(config);
    return Response.json(result);
  }
  
  if (action === 'canTrain') {
    const status = await coordinator.canTrain(config);
    return Response.json(status);
  }
}
```

---

## 📚 References

- [Online Learning](https://en.wikipedia.org/wiki/Online_machine_learning)
- [Incremental Learning](https://en.wikipedia.org/wiki/Incremental_learning)
- [Continuous Training](https://developers.google.com/machine-learning/guides/rules-of-ml#rule_43_have_a_simple_pipeline)
- [Fine-tuning Transformers](https://huggingface.co/docs/transformers/training)

---

## 🔜 Roadmap

### High Priority
- [ ] **Real Backpropagation** - Implement gradient calculation & weight updates
- [ ] **Loss Functions** - Cross-entropy, perplexity
- [ ] **Validation Split** - Holdout set for evaluation
- [ ] **Early Stopping** - Prevent overfitting

### Medium Priority
- [ ] Batch training (currently sequential)
- [ ] Learning rate scheduling
- [ ] Gradient clipping
- [ ] Regularization (L2, dropout)
- [ ] Mixed precision training (float16)

### Future
- [ ] Multi-GPU training
- [ ] Distributed training
- [ ] Hyperparameter optimization
- [ ] A/B testing for model versions
- [ ] Continual learning strategies

---

## ⚠️ Current Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **Simulated training** | Weights don't actually improve | Real backprop in Phase 4 |
| **No validation** | Can't measure generalization | Manual testing for now |
| **Sequential processing** | Slow for large batches | Reduce batch size |
| **No GPU support** | Training is CPU-bound | Use smaller batches, fewer epochs |

---

**Status**: ✅ Production (Simulation) | **Phase 3 Complete** | Real Backprop TODO  
**Flow**: Metrics → Export → Prepare → Train (simulated) → Checkpoint → Mark Learned  
**Trigger**: Automatic (50+ samples) or Manual (API call)
