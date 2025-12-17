/**
 * File: src/ai/knowledge-domains/react/react_inferenceController.ts
 * Purpose: Run inference for React domain queries
 * Depends on: react_parser.ts, react_semanticAnalyzer.ts, react_embeddings.ts
 * Depended on by: react_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { parseReactInput } from "./react_parser";
import { analyzeReactSemantics } from "./react_semanticAnalyzer";

export interface ReactInferenceResult {
  response: string;
  confidence: number;
  topics: string[];
  metadata: {
    intent: string;
    complexity: string;
    parseType: string;
  };
}

export async function reactRunInference(
  input: string,
): Promise<ReactInferenceResult | null> {
  const lowerInput = input.toLowerCase();

  if (context && Object.keys(context).length > 0) {
    console.log(`[React Domain] Context keys: ${Object.keys(context).join(", ")}`)
  }

  // Check if this query is relevant to React
  const reactKeywords = [
    "react",
    "component",
    "jsx",
    "tsx",
    "hook",
    "usestate",
    "useeffect",
    "props",
    "state",
    "render",
  ];

  const isReactQuery = reactKeywords.some((keyword) =>
    lowerInput.includes(keyword),
  );

  if (!isReactQuery) {
    return null; // Not a React query
  }

  try {
    const parseResult = parseReactInput(input);
    const semanticAnalysis = analyzeReactSemantics(input);

    let response = "";

    // Generate response based on parse type and semantic analysis
    switch (parseResult.type) {
      case "component":
        response = generateComponentResponse(input, semanticAnalysis);
        break;
      case "hook":
        response = generateHookResponse(input, semanticAnalysis);
        break;
      case "pattern":
        response = generatePatternResponse(input, semanticAnalysis);
        break;
      case "question":
        response = generateQuestionResponse(input, semanticAnalysis);
        break;
      case "code":
        response = generateCodeResponse(input, semanticAnalysis);
        break;
      default:
        response = generateGeneralResponse(input, semanticAnalysis);
    }

    return {
      response,
      confidence: semanticAnalysis.confidence,
      topics: semanticAnalysis.topics,
      metadata: {
        intent: semanticAnalysis.intent,
        complexity: semanticAnalysis.complexity,
        parseType: parseResult.type,
      },
    };
  } catch (error) {
    console.error("[React Domain] Inference error:", error);
    return null;
  }
}

function generateComponentResponse(_input: string, analysis: any): string {
  return `React components are the building blocks of React applications. ${analysis.suggestedResponse} Components can be functional or class-based, with functional components being the modern standard.`;
}

function generateHookResponse(_input: string, analysis: any): string {
  const hookTypes = analysis.topics.filter((t: string) => t.startsWith("use"));
  if (hookTypes.length > 0) {
    return `React Hooks like ${hookTypes.join(", ")} allow you to use state and other React features in functional components. ${analysis.suggestedResponse}`;
  }
  return `React Hooks are functions that let you use state and lifecycle features in functional components. ${analysis.suggestedResponse}`;
}

function generatePatternResponse(_input: string, analysis: any): string {
  return `React patterns help organize code and solve common problems. ${analysis.suggestedResponse} Common patterns include composition, render props, higher-order components, and custom hooks.`;
}

function generateQuestionResponse(_input: string, analysis: any): string {
  return `${analysis.suggestedResponse} React is a JavaScript library for building user interfaces, focusing on component-based architecture and declarative programming.`;
}

function generateCodeResponse(input: string, analysis: ReactSemanticAnalysis): string {
  const lowerInput = input.toLowerCase();

  // Generate actual code examples based on the request
  let codeExample = "";

  if (
    lowerInput.includes("hello world") ||
    lowerInput.includes("simple component")
  ) {
    codeExample = `

Here's a simple React component example:

\`\`\`jsx
import React from 'react';

export default function HelloWorld() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>Welcome to React!</p>
    </div>
  );
}
\`\`\``;
  } else if (lowerInput.includes("state") || lowerInput.includes("usestate")) {
    codeExample = `

Here's a React component with state:

\`\`\`jsx
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\``;
  } else if (lowerInput.includes("props")) {
    codeExample = `

Here's a React component with props:

\`\`\`jsx
import React from 'react';

export default function Greeting({ name, message }) {
  return (
    <div>
      <h2>Hello, {name}!</h2>
      <p>{message}</p>
    </div>
  );
}

// Usage:
// <Greeting name="Alice" message="Welcome to React!" />
\`\`\``;
  } else if (
    lowerInput.includes("component") ||
    lowerInput.includes("create")
  ) {
    codeExample = `

Here's a basic React functional component:

\`\`\`jsx
import React from 'react';

export default function MyComponent() {
  return (
    <div className="my-component">
      <h2>My Component</h2>
      <p>This is a reusable React component.</p>
    </div>
  );
}
\`\`\``;
  }

  return `${analysis.suggestedResponse}${codeExample}

React uses JSX syntax to describe UI, and components manage their own state and props.`;
}

function generateGeneralResponse(_input: string, analysis: any): string {
  return `${analysis.suggestedResponse} React provides a powerful and flexible way to build modern web applications with reusable components.`;
}
