import { parseProgrammingInput } from "./programming_parser";

export interface ProgrammingSemanticAnalysis {
  intent: "learn" | "implement" | "debug" | "optimize" | "explain";
  confidence: number;
  topics: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  suggestedResponse: string;
}

export function analyzeProgrammingSemantics(
  input: string,
): ProgrammingSemanticAnalysis {
  const parseResult = parseProgrammingInput(input);
  const lowerInput = input.toLowerCase();

  let intent: ProgrammingSemanticAnalysis["intent"] = "explain";
  let confidence = 0.6;
  const topics: string[] = [];
  let complexity: ProgrammingSemanticAnalysis["complexity"] = "beginner";

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
    confidence = 0.85;
  } else if (
    lowerInput.includes("debug") ||
    lowerInput.includes("error") ||
    lowerInput.includes("fix")
  ) {
    intent = "debug";
    confidence = 0.9;
  } else if (
    lowerInput.includes("optimize") ||
    lowerInput.includes("improve") ||
    lowerInput.includes("performance")
  ) {
    intent = "optimize";
    confidence = 0.75;
  }

  if (parseResult.metadata.language) topics.push(parseResult.metadata.language);
  if (parseResult.metadata.paradigm) topics.push(parseResult.metadata.paradigm);
  if (parseResult.type !== "general") topics.push(parseResult.type);

  if (lowerInput.includes("advanced") || lowerInput.includes("complex"))
    complexity = "advanced";
  else if (lowerInput.includes("intermediate") || topics.length > 2)
    complexity = "intermediate";

  const topicStr =
    topics.length > 0 ? topics.join(", ") : "programming concepts";
  const suggestedResponse = `I can help with ${topicStr} at a ${complexity} level.`;

  return { intent, confidence, topics, complexity, suggestedResponse };
}
