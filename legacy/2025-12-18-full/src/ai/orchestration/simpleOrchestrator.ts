/**
 * File: src/ai/orchestration/simpleOrchestrator.ts
 * Purpose: Simplified orchestrator for browser-based preview environment
 * This is a lightweight version that works without complex dependencies
 */

export interface SimplePrompt {
  text: string;
  sessionId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface SimpleResponse {
  text: string;
  sources: string[];
  confidence: number;
  domains: string[];
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Simple AI Orchestrator for preview environment
 */
export class SimpleOrchestrator {
  private static instance: SimpleOrchestrator;
  private initialized = false;
  private sessions = new Map<
    string,
    Array<{ role: string; content: string }>
  >();

  private constructor() {}

  public static getInstance(): SimpleOrchestrator {
    if (!SimpleOrchestrator.instance) {
      SimpleOrchestrator.instance = new SimpleOrchestrator();
    }
    return SimpleOrchestrator.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    console.log("[SimpleOrchestrator] Initializing...");
    this.initialized = true;
    console.log("[SimpleOrchestrator] Initialization complete");
  }

  public async processPrompt(prompt: SimplePrompt): Promise<SimpleResponse> {
    const text = prompt.text.toLowerCase();
    const domains: string[] = [];
    let responseText = "";

    // Domain detection
    if (text.match(/\b(math|calculate|equation|number)\b/)) {
      domains.push("mathematics");
      responseText = this.handleMath(prompt.text);
    } else if (text.match(/\b(code|program|typescript|javascript)\b/)) {
      domains.push("typescript");
      responseText = this.handleCode(prompt.text);
    } else if (text.match(/\b(grammar|spell|english)\b/)) {
      domains.push("english");
      responseText = this.handleEnglish(prompt.text);
    } else {
      domains.push("general");
      responseText = this.handleGeneral(prompt.text);
    }

    // Store in session history
    if (prompt.sessionId) {
      let history = this.sessions.get(prompt.sessionId);
      if (!history) {
        history = [];
        this.sessions.set(prompt.sessionId, history);
      }
      history.push({ role: "user", content: prompt.text });
      history.push({ role: "assistant", content: responseText });
    }

    return {
      text: responseText,
      sources: domains.map((d) => `Domain: ${d}`),
      confidence: 0.85,
      domains,
      timestamp: Date.now(),
      metadata: {
        simplified: true,
        previewMode: true,
      },
    };
  }

  private handleMath(text: string): string {
    // Simple math detection
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const a = Number.parseInt(numbers[0]);
      const b = Number.parseInt(numbers[1]);
      if (text.includes("+") || text.includes("add") || text.includes("sum")) {
        return `The sum of ${a} and ${b} is ${a + b}.`;
      }
      if (text.includes("-") || text.includes("subtract")) {
        return `${a} minus ${b} equals ${a - b}.`;
      }
      if (
        text.includes("*") ||
        text.includes("multiply") ||
        text.includes("times")
      ) {
        return `${a} times ${b} equals ${a * b}.`;
      }
      if (text.includes("/") || text.includes("divide")) {
        return `${a} divided by ${b} equals ${(a / b).toFixed(2)}.`;
      }
    }
    return "I can help with mathematical calculations. Try asking me to add, subtract, multiply, or divide numbers.";
  }

  private handleCode(text: string): string {
    return `I can assist with TypeScript and JavaScript code. This is a simplified preview mode. The full AI system includes advanced code analysis, review, and generation capabilities across multiple programming domains.`;
  }

  private handleEnglish(text: string): string {
    return `I can help with English grammar and language questions. This is a simplified preview mode. The full system includes comprehensive grammar checking, spell checking, and language analysis.`;
  }

  private handleGeneral(text: string): string {
    return `I'm a hybrid modular AI assistant with 16 knowledge domains including mathematics, TypeScript, English, science, code review, testing, documentation, security, algorithms, data structures, version control, and environment management. This is a simplified preview mode - the full system includes advanced neural inference, context management, and learning capabilities. How can I help you today?`;
  }

  public createSession(): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, []);
    return sessionId;
  }
}

export const simpleOrchestrator = SimpleOrchestrator.getInstance();
