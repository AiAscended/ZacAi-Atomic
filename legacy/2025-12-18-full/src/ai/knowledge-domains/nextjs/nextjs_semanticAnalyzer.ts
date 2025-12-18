/**
 * File: src/ai/data/nextjs/nextjs_semanticAnalyzer.ts
 * Purpose: Analyze semantic meaning of Next.js queries and code
 * Depends on: nextjs_parser.ts
 * Depended on by: nextjs_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { parseNextjsInput } from "./nextjs_parser";

export interface NextjsSemanticAnalysis {
  intent: "learn" | "implement" | "migrate" | "optimize" | "debug" | "deploy";
  confidence: number;
  topics: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  suggestedResponse: string;
}

export function analyzeNextjsSemantics(input: string): NextjsSemanticAnalysis {
  const parseResult = parseNextjsInput(input);
  const lowerInput = input.toLowerCase();

  let intent: NextjsSemanticAnalysis["intent"] = "learn";
  let confidence = 0.5;
  const topics: string[] = [];
  let complexity: NextjsSemanticAnalysis["complexity"] = "beginner";

  // Determine intent
  if (
    lowerInput.includes("how") ||
    lowerInput.includes("what") ||
    lowerInput.includes("explain")
  ) {
    intent = "learn";
    confidence = 0.8;
  } else if (
    lowerInput.includes("create") ||
    lowerInput.includes("build") ||
    lowerInput.includes("implement")
  ) {
    intent = "implement";
    confidence = 0.9;
  } else if (
    lowerInput.includes("migrate") ||
    lowerInput.includes("upgrade") ||
    lowerInput.includes("convert")
  ) {
    intent = "migrate";
    confidence = 0.85;
  } else if (
    lowerInput.includes("optimize") ||
    lowerInput.includes("improve") ||
    lowerInput.includes("performance")
  ) {
    intent = "optimize";
    confidence = 0.8;
  } else if (
    lowerInput.includes("error") ||
    lowerInput.includes("bug") ||
    lowerInput.includes("fix")
  ) {
    intent = "debug";
    confidence = 0.85;
  } else if (
    lowerInput.includes("deploy") ||
    lowerInput.includes("production") ||
    lowerInput.includes("build")
  ) {
    intent = "deploy";
    confidence = 0.8;
  }

  // Extract topics
  if (parseResult.metadata.routerType)
    topics.push(`${parseResult.metadata.routerType}-router`);
  if (parseResult.metadata.hasServerComponents)
    topics.push("server-components");
  if (parseResult.metadata.hasClientComponents)
    topics.push("client-components");
  if (parseResult.metadata.hasServerActions) topics.push("server-actions");
  if (parseResult.metadata.hasMetadata) topics.push("metadata");
  if (parseResult.metadata.fileType) topics.push(parseResult.metadata.fileType);
  if (parseResult.type !== "general") topics.push(parseResult.type);

  // Determine complexity
  if (
    lowerInput.includes("advanced") ||
    lowerInput.includes("complex") ||
    topics.includes("server-actions") ||
    topics.length > 3
  ) {
    complexity = "advanced";
  } else if (lowerInput.includes("intermediate") || topics.length > 1) {
    complexity = "intermediate";
  }

  const suggestedResponse = generateNextjsSuggestedResponse(
    intent,
    topics,
    complexity,
  );

  return {
    intent,
    confidence,
    topics,
    complexity,
    suggestedResponse,
  };
}

function generateNextjsSuggestedResponse(
  intent: NextjsSemanticAnalysis["intent"],
  topics: string[],
  complexity: NextjsSemanticAnalysis["complexity"],
): string {
  const topicStr = topics.length > 0 ? topics.join(", ") : "Next.js concepts";

  switch (intent) {
    case "learn":
      return `I can explain ${topicStr} at a ${complexity} level.`;
    case "implement":
      return `I can guide you through implementing ${topicStr}.`;
    case "migrate":
      return `I can help you migrate to ${topicStr}.`;
    case "optimize":
      return `I can suggest optimizations for ${topicStr}.`;
    case "debug":
      return `I can help debug issues with ${topicStr}.`;
    case "deploy":
      return `I can guide you through deploying with ${topicStr}.`;
  }
}
