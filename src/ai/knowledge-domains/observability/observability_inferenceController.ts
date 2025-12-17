/**
 * File: src/ai/knowledge-domains/observability/observability_inferenceController.ts
 * Purpose: Observability domain inference controller
 * Handles inference for monitoring, logging, tracing, and metrics queries
 */

import { DOMAIN_NAME } from "./observability_constants";

export const observabilityRunInference = async (
  input: string,
  _context?: any,
) => {
  const lowerInput = input.toLowerCase();

  let responseText = "";
  let confidence = 0.7;
  const sources: string[] = [];

  // Detect observability keywords
  if (
    lowerInput.includes("log") ||
    lowerInput.includes("monitor") ||
    lowerInput.includes("metric") ||
    lowerInput.includes("trace") ||
    lowerInput.includes("observability") ||
    lowerInput.includes("telemetry") ||
    lowerInput.includes("alert")
  ) {
    confidence = 0.85;

    responseText = `I can help with observability and monitoring. Key pillars:

**Logging:**
- Structured logging (JSON logs)
- Log levels (DEBUG, INFO, WARN, ERROR)
- Log aggregation (ELK stack, Splunk)
- Log analysis and parsing

**Metrics:**
- Performance metrics (latency, throughput)
- Business metrics (users, revenue)
- Infrastructure metrics (CPU, memory, disk)
- Custom metrics and dashboards

**Tracing:**
- Distributed tracing
- Request flow tracking
- Span and trace IDs
- Performance bottleneck identification

**Alerting:**
- Threshold-based alerts
- Anomaly detection
- Alert fatigue reduction
- On-call and incident management

What observability topic would you like to explore?`;
  } else {
    responseText = `I'm the Observability domain. I cover:
- Logging best practices
- Monitoring and metrics
- Distributed tracing
- Alerting strategies
- Performance analysis

How can I help you improve your system's observability?`;
  }
}

/**
 * Run inference for observability queries
 */
export const observabilityRunInference = async (input: string): Promise<any> => {
  const normalizedInput = input.toLowerCase();
  
  // Keywords for observability
  const observabilityKeywords = [
    'monitor', 'monitoring', 'log', 'logging', 'trace', 'tracing',
    'metric', 'metrics', 'alert', 'alerting', 'telemetry',
    'performance', 'latency', 'throughput', 'error rate',
    'dashboard', 'observe', 'visibility', 'instrumentation'
  ];
  
  const hasObservabilityKeyword = observabilityKeywords.some(keyword => 
    normalizedInput.includes(keyword)
  );
  
  if (!hasObservabilityKeyword) {
    return null;
  }
  
  try {
    const seedData = await loadSeedData();
    
    const matches = seedData.filter(concept => {
      const conceptText = JSON.stringify(concept).toLowerCase();
      return observabilityKeywords.some(keyword => conceptText.includes(keyword));
    });
    
    if (matches.length === 0) {
      return null;
    }
    
    return {
      response: `Observability insights: Found ${matches.length} relevant monitoring concepts. Consider implementing comprehensive monitoring, logging, and alerting for better system visibility and operational awareness.`,
      confidence: 0.85,
      topics: ['monitoring', 'logging', 'metrics', 'alerting'],
      metadata: {
        domain: DOMAIN_NAME,
        totalConcepts: seedData.length,
        matchCount: matches.length,
        matches: matches.slice(0, 5)
      }
    };
  } catch (error) {
    console.error('[Observability] Inference error:', error);
    return null;
  }
};

export default observabilityRunInference;
