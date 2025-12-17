/**
 * System Domain Inference Controller
 * Handles system-level operations, configuration, time/date, location, and management queries
 */

import { DOMAIN_NAME } from "./system_constants"

type SystemMetadata = {
  timestamp?: string
  inferenceMethod?: string
  systemFunction?: boolean
}

export const systemRunInference = async (input: string, _context?: unknown) => {
  const lowerInput = input.toLowerCase();
  
  let responseText = '';
  let confidence = 0.7;
  const sources: string[] = [];
  const metadata: SystemMetadata = {};

  // Handle time/date queries - return actual system time/date
  if (
    lowerInput.includes("time") ||
    lowerInput.includes("date") ||
    lowerInput.includes("day") ||
    lowerInput.includes("today") ||
    lowerInput.includes("now") ||
    lowerInput.includes("when") ||
    lowerInput.includes("what's the date") ||
    lowerInput.includes("what is the date")
  ) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
    const dateStr = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    responseText = `**Current System Time & Date:**\n\n`;
    responseText += `🕐 **Time**: ${timeStr}\n`;
    responseText += `📅 **Date**: ${dateStr}\n\n`;
    responseText += `*Note: This is server time (UTC-based). For your local time, I'd need your timezone or location information.*`;
    
    sources.push("System Clock (JavaScript Date API)");
    confidence = 0.98;
    metadata.timestamp = now.toISOString();
    metadata.inferenceMethod = 'system_time';

    return {
      response: responseText,
      confidence,
      sources,
      domain: DOMAIN_NAME,
      metadata,
    };
  }

  if (referencesHybridPipeline) {
    confidence = 0.9;
    metadata.inferenceMethod = 'system_overview';
    metadata.timestamp = new Date().toISOString();

    responseText = `**ZacAi Hybrid Pipeline Overview**\n\n`;
    responseText += `1. **Prompt Processor** – normalizes the user message, extracts tasks, and tags tokens for downstream models.\n`;
    responseText += `2. **Domain Router** – maps the cleaned prompt to active knowledge domains (general_knowledge, system, internet_search, etc.) using the unified registry.\n`;
    responseText += `3. **Domain Inference Layer** – each domain runs its own tokenizer, semantic analyzer, and seed-backed inference controller to return focused insights.\n`;
    responseText += `4. **Unified Transformer LLM** – loads shared vocabulary + combined weights (seeded checkpoints + learned weights) to synthesize narrative answers when high-quality logits are available.\n`;
    responseText += `5. **Response Synthesizer** – merges domain findings, LLM output, and heuristic fallbacks, then formats blocks for the admin/dev consoles.\n\n`;
    responseText += `**Knowledge + Memory Stack**\n- Seeds: every domain exposes JSON seed vocabularies that the orchestrator can query even if a model is offline.\n- Weights: the LLM weights manager loads latest checkpoints and merges pretrained, learned, and scratch layers so the model always has usable tensors.\n- Metrics: every inference logs confidence, latency, and token usage for continuous training jobs.`;

    responseText += `\n\n**Self-Healing Behavior**\nIf domains or the LLM are unavailable, the orchestrator still produces an answer by combining seeds, heuristics, and system status so operators always see a substantive response instead of a generic fallback.`;

    sources.push('System Architecture Registry');

    return {
      response: responseText,
      confidence,
      sources,
      domain: DOMAIN_NAME,
      metadata,
    };
  }

  // Handle location/timezone queries
  if (
    lowerInput.includes("location") ||
    lowerInput.includes("where") ||
    lowerInput.includes("timezone") ||
    lowerInput.includes("time zone")
  ) {
    responseText = `**System Location Information:**\n\n`;
    responseText += `Server is running in a cloud environment. To provide accurate location-based information, I would need:\n\n`;
    responseText += `- Your timezone preference\n`;
    responseText += `- Your geographic location (city/country)\n`;
    responseText += `- Or IP-based geolocation (with your permission)\n\n`;
    responseText += `*Note: Location services require additional APIs and user permissions for accuracy.*`;
    
    confidence = 0.75;
    sources.push("System Information");
    metadata.inferenceMethod = 'system_location';

    return {
      response: responseText,
      confidence,
      sources,
      domain: DOMAIN_NAME,
      metadata,
    };
  }

  // Handle system configuration/setup queries
  if (
    lowerInput.includes('system') ||
    lowerInput.includes('config') ||
    lowerInput.includes('setup') ||
    lowerInput.includes('install') ||
    lowerInput.includes('environment') ||
    lowerInput.includes('deployment')
  ) {
    confidence = 0.85;
    
    responseText = `I can help with system-level operations and configuration:\n\n`;
    responseText += `**Common System Tasks:**\n`;
    responseText += `- ⚙️ Configuration management\n`;
    responseText += `- 📦 Environment setup & dependencies\n`;
    responseText += `- 🚀 Deployment processes\n`;
    responseText += `- 🔧 System resource management\n`;
    responseText += `- 🐛 System-level troubleshooting\n`;
    responseText += `- 🕐 Time/date/timezone handling\n\n`;
    responseText += `What specific system operation do you need help with?`;
    
    sources.push("System Domain Knowledge");
    metadata.inferenceMethod = 'system_overview';
  } else {
    responseText = `System domain handles:\n`;
    responseText += `- System operations & utilities\n`;
    responseText += `- Time, date, and timezone information\n`;
    responseText += `- Configuration management\n`;
    responseText += `- Environment setup\n\n`;
    responseText += `How can I assist you?`;
    
    confidence = 0.6;
    sources.push("System Domain");
    metadata.inferenceMethod = 'system_overview';
  }

  return {
    response: responseText,
    confidence,
    sources,
    domain: DOMAIN_NAME,
    metadata,
  };
};

export default systemRunInference;
