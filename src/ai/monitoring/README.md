# Monitoring & Learning Metrics

**Complete Inference Tracking** | Continuous Learning Pipeline | Quality Assessment

> Tracks every AI inference with comprehensive metrics (prompt, response, confidence, domains, timing) for continuous improvement and training data generation.

---

## 🎯 Overview

The monitoring system provides the **feedback loop** for continuous learning:

✅ **Inference Tracking** - Every prompt→response recorded  
✅ **Quality Metrics** - Confidence scores, user feedback, processing time  
✅ **Training Data Export** - High-quality samples for model improvement  
✅ **Smart Caching** - Batch writes (1000 samples) for performance  
✅ **Automatic Cleanup** - Retention policies for old data  

---

## 🏗️ Architecture

```
Every AI Inference
    ↓
┌────────────────────────────────────────┐
│  LearningMetricsTracker                │
│  • Record inference metrics            │
│  • Cache in memory (1000 samples)      │
│  • Flush to learnt.json                │
└────────────────────────────────────────┘
    ↓
data/learning/learnt.json
    ↓
┌────────────────────────────────────────┐
│  Training Coordinator                  │
│  • Export high-quality samples         │
│  • Train when threshold met (50+)      │
│  • Update model weights                │
└────────────────────────────────────────┘
    ↓
Improved Model Weights
```

---

## 📁 Module Structure

```
monitoring/
├── learningMetricsTracker.ts    # ⭐ METRICS COLLECTION SYSTEM
└── README.md
```

**Storage**: `data/learning/learnt.json` (auto-created)

---

## 🚀 Usage

### Record Inference

```typescript
import { LearningMetricsTracker } from '@/ai/monitoring/learningMetricsTracker';

const tracker = LearningMetricsTracker.getInstance();

await tracker.recordInference({
  prompt: "Explain TypeScript generics",
  response: "Generics in TypeScript allow...",
  confidence: 0.88,
  domains: ["typescript", "programming"],
  models: ["unified-transformer-llm"],
  processingTime: 234,  // milliseconds
  userFeedback: {
    helpful: true,
    rating: 5,
  },
  qualityScores: {
    relevance: 0.92,
    coherence: 0.89,
    accuracy: 0.91,
  },
});

// Automatically cached and flushed to disk
```

### Get Learning Statistics

```typescript
const stats = await tracker.getStatistics();

console.log(stats);
// {
//   totalInferences: 1247,
//   unlearnedSamples: 143,
//   averageConfidence: 0.78,
//   domainDistribution: {
//     typescript: 342,
//     programming: 278,
//     react: 156,
//     ...
//   },
//   modelUsage: {
//     "unified-transformer-llm": 1247
//   },
//   averageProcessingTime: 187ms
// }
```

### Export Training Data

```typescript
// Export high-quality samples for training
const trainingData = await tracker.exportForTraining({
  minConfidence: 0.7,      // Only confident samples
  maxSamples: 100,         // Limit batch size
  requireFeedback: false,  // Optional user feedback
});

console.log(trainingData.length);  // e.g., 73 samples

// Each sample:
// {
//   input: "Explain TypeScript generics",
//   target: "Generics in TypeScript allow...",
//   confidence: 0.88,
//   metadata: { domains, processingTime, ... }
// }
```

### Manual Flush

```typescript
// Force flush to disk (usually automatic)
const flushedCount = await tracker.flushToDisk();
console.log(`Flushed ${flushedCount} samples`);
```

---

## 🔬 Metrics Data Structure

### InferenceMetrics

```typescript
interface InferenceMetrics {
  // Core data
  prompt: string;                  // User input
  response: string;                // AI output
  confidence: number;              // 0.0-1.0 overall confidence
  
  // Context
  domains: string[];               // Domains used
  models: string[];                // Models used
  processingTime: number;          // Milliseconds
  
  // Metadata
  timestamp: string;               // ISO 8601
  sessionId?: string;              // User session
  learnedFrom?: boolean;           // Used for training?
  
  // Quality assessment
  userFeedback?: {
    helpful?: boolean;
    rating?: number;               // 1-5
    comment?: string;
  };
  
  qualityScores?: {
    relevance?: number;            // 0.0-1.0
    coherence?: number;            // 0.0-1.0
    accuracy?: number;             // 0.0-1.0
  };
  
  // Additional context
  metadata?: {
    thinkingSteps?: any[];
    domainResults?: any;
    synthesisStrategy?: string;
    [key: string]: any;
  };
}
```

### Storage Format (learnt.json)

```json
{
  "metrics": [
    {
      "prompt": "Explain TypeScript generics",
      "response": "Generics in TypeScript allow...",
      "confidence": 0.88,
      "domains": ["typescript", "programming"],
      "models": ["unified-transformer-llm"],
      "processingTime": 234,
      "timestamp": "2024-01-15T10:30:45.123Z",
      "sessionId": "session-abc123",
      "learnedFrom": false,
      "userFeedback": {
        "helpful": true,
        "rating": 5
      },
      "qualityScores": {
        "relevance": 0.92,
        "coherence": 0.89,
        "accuracy": 0.91
      }
    },
    // ... more samples
  ],
  "metadata": {
    "lastFlush": "2024-01-15T10:35:00.000Z",
    "totalSamples": 1247,
    "version": "1.0"
  }
}
```

---

## 🧩 Key Features

### Smart Caching

```typescript
// Cache in memory for performance
private metricsCache: InferenceMetrics[] = [];
private readonly CACHE_THRESHOLD = 1000;

async recordInference(metrics: InferenceMetrics) {
  this.metricsCache.push(metrics);
  
  // Auto-flush when cache is full
  if (this.metricsCache.length >= this.CACHE_THRESHOLD) {
    await this.flushToDisk();
  }
}
```

### Unlearned Samples

```typescript
// Get samples not yet used for training
const unlearnedSamples = await tracker.getUnlearnedMetrics();

// Samples where learnedFrom !== true
// Used by TrainingCoordinator to find new training data
```

### Quality Filtering

```typescript
// Export only high-quality samples
const highQuality = await tracker.exportForTraining({
  minConfidence: 0.8,         // Very confident
  requireFeedback: true,      // User confirmed helpful
  minRating: 4,               // 4+ stars
  maxSamples: 50,
});

// Perfect for fine-tuning critical domains
```

### Automatic Cleanup

```typescript
// Remove old metrics (default: keep last 30 days)
const removed = await tracker.cleanOldMetrics(30);
console.log(`Removed ${removed} old samples`);

// Prevents unbounded growth
// Run periodically via cron or scheduled task
```

---

## 📊 Statistics & Analytics

### Domain Distribution

```typescript
const stats = await tracker.getStatistics();

console.log(stats.domainDistribution);
// {
//   typescript: 342,    // Most popular
//   programming: 278,
//   react: 156,
//   nextjs: 98,
//   mathematics: 67,
//   ...
// }

// Use to identify domain usage patterns
// Allocate training resources accordingly
```

### Confidence Analysis

```typescript
console.log(stats.averageConfidence);  // 0.78

// Confidence distribution
const lowConfidence = metrics.filter(m => m.confidence < 0.5).length;
const highConfidence = metrics.filter(m => m.confidence > 0.8).length;

// Identifies areas needing improvement
```

### Performance Tracking

```typescript
console.log(stats.averageProcessingTime);  // 187ms

// Identify slow domains/queries
const slowInferences = metrics.filter(m => m.processingTime > 500);

// Optimize bottlenecks
```

---

## 🔧 Configuration

### Cache Settings

```typescript
// Adjust cache threshold
const CACHE_THRESHOLD = 500;  // Flush more frequently

// Adjust flush frequency
setInterval(() => {
  tracker.flushToDisk();
}, 60000);  // Every 60 seconds
```

### Retention Policy

```typescript
// Keep metrics for 90 days
await tracker.cleanOldMetrics(90);

// Keep all metrics (no cleanup)
// (Not recommended for production)
```

### Export Filters

```typescript
// Conservative filter (highest quality only)
const conservative = {
  minConfidence: 0.85,
  requireFeedback: true,
  minRating: 5,
  maxSamples: 20,
};

// Liberal filter (more training data)
const liberal = {
  minConfidence: 0.6,
  requireFeedback: false,
  maxSamples: 200,
};
```

---

## 🧪 Testing

```typescript
describe('LearningMetricsTracker', () => {
  it('should record inference metrics', async () => {
    await tracker.recordInference({
      prompt: "test",
      response: "response",
      confidence: 0.8,
      domains: ["typescript"],
      models: ["unified-transformer-llm"],
      processingTime: 100,
    });
    
    const stats = await tracker.getStatistics();
    expect(stats.totalInferences).toBeGreaterThan(0);
  });
  
  it('should flush to disk when cache is full', async () => {
    // Record 1000 samples
    for (let i = 0; i < 1000; i++) {
      await tracker.recordInference({ /* ... */ });
    }
    
    // Should auto-flush
    const stats = await tracker.getStatistics();
    expect(stats.totalInferences).toBe(1000);
  });
  
  it('should export high-quality samples', async () => {
    const training = await tracker.exportForTraining({
      minConfidence: 0.8,
      maxSamples: 10,
    });
    
    training.forEach(sample => {
      expect(sample.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });
});
```

---

## 📈 Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Record Time** | <1ms | In-memory cache |
| **Flush Time** | 50-200ms | Depends on batch size |
| **Export Time** | 10-100ms | Depends on filter |
| **Memory Usage** | ~5MB | Per 1000 cached samples |
| **Storage Growth** | ~1KB/sample | JSON format |

---

## 🛠️ Maintenance

### Regular Cleanup

```bash
# Add to cron or scheduled task
# Run daily to clean old metrics
0 2 * * * node -e "
  import { LearningMetricsTracker } from './src/ai/monitoring/learningMetricsTracker';
  const tracker = LearningMetricsTracker.getInstance();
  await tracker.cleanOldMetrics(30);
"
```

### Backup Metrics

```bash
# Backup before cleanup
cp data/learning/learnt.json data/learning/backups/learnt_$(date +%Y%m%d).json

# Compress old backups
gzip data/learning/backups/*.json
```

### Monitor Storage

```typescript
// Check file size
const stats = fs.statSync('data/learning/learnt.json');
console.log(`Metrics file: ${stats.size / 1024 / 1024} MB`);

// Alert if too large (>100MB)
if (stats.size > 100 * 1024 * 1024) {
  console.warn('Metrics file too large! Run cleanup.');
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Metrics not saving | Check file permissions on `data/learning/` |
| File too large | Run `cleanOldMetrics()`, adjust retention |
| Memory leak | Reduce CACHE_THRESHOLD, flush more often |
| Slow exports | Reduce `maxSamples`, add more filters |
| Duplicate entries | Ensure single tracker instance (singleton) |

---

## 🔗 Integration Points

### With MainOrchestrator

```typescript
// mainOrchestrator.ts records after every inference
await learningMetricsTracker.recordInference({
  prompt,
  response: finalResponse.text,
  confidence: finalResponse.confidence,
  domains: relevantDomains,
  models: ['unified-transformer-llm'],
  processingTime: Date.now() - startTime,
  metadata: { thinkingSteps, domainResults },
});
```

### With TrainingCoordinator

```typescript
// trainingCoordinator.ts exports for training
const trainingData = await tracker.exportForTraining({
  minConfidence: config.minConfidence,
  maxSamples: config.maxSamplesPerBatch,
});

// After training, mark as learned
await tracker.markAsLearned(trainingData.map(d => d.metadata.id));
```

### With API Routes

```typescript
// app/api/learning/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (action === 'statistics') {
    const stats = await tracker.getStatistics();
    return Response.json(stats);
  }
  
  if (action === 'exportForTraining') {
    const data = await tracker.exportForTraining({
      minConfidence: parseFloat(searchParams.get('minConfidence') || '0.7'),
      maxSamples: parseInt(searchParams.get('maxSamples') || '100'),
    });
    return Response.json(data);
  }
}
```

---

## 📚 References

- [Continuous Learning](https://en.wikipedia.org/wiki/Incremental_learning)
- [Online Learning](https://en.wikipedia.org/wiki/Online_machine_learning)
- [Metrics Collection Best Practices](https://martinfowler.com/articles/domain-oriented-observability.html)

---

## 🔜 Roadmap

- [ ] Real-time metrics dashboard (UI)
- [ ] Advanced analytics (charts, trends)
- [ ] A/B testing framework
- [ ] Anomaly detection
- [ ] Multi-user feedback aggregation
- [ ] Integration with external analytics

---

**Status**: ✅ Production | **Phase 3 Complete** | Recording Every Inference  
**Flow**: Inference → Record → Cache → Flush → Export → Training → Improved Model  
**Storage**: `data/learning/learnt.json` (auto-created)
