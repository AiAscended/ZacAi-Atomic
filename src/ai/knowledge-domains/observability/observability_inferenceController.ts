/**
 * Observability Domain Inference Controller
 * Handles logging, monitoring, metrics, and observability queries
 */

import { DOMAIN_NAME } from './observability_constants';

export const observabilityRunInference = async (input: string, _context?: unknown) => {
  const lowerInput = input.toLowerCase();
  
  let responseText = '';
  let confidence = 0.7;
  const sources: string[] = [];

  // Detect observability keywords
  if (
    lowerInput.includes('log') ||
    lowerInput.includes('monitor') ||
    lowerInput.includes('metric') ||
    lowerInput.includes('trace') ||
    lowerInput.includes('observability') ||
    lowerInput.includes('telemetry') ||
    lowerInput.includes('alert')
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

  return {
    text: responseText,
    confidence,
    sources,
    domain: DOMAIN_NAME,
  };
};

export default observabilityRunInference;
