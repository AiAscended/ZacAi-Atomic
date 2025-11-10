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
    metadata.inferenceMethod = "system_time";
    metadata.systemFunction = true;

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
    metadata.systemFunction = true;

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
    metadata.systemFunction = true;
  } else {
    responseText = `System domain handles:\n`;
    responseText += `- System operations & utilities\n`;
    responseText += `- Time, date, and timezone information\n`;
    responseText += `- Configuration management\n`;
    responseText += `- Environment setup\n\n`;
    responseText += `How can I assist you?`;
    
    confidence = 0.6;
    sources.push("System Domain");
    metadata.systemFunction = true;
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
