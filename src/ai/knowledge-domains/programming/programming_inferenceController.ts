import { parseProgrammingInput } from "./programming_parser";
import { analyzeProgrammingSemantics } from "./programming_semanticAnalyzer";

export interface ProgrammingInferenceResult {
  response: string;
  confidence: number;
  topics: string[];
  metadata: { intent: string; complexity: string; parseType: string };
}

// Code examples library
const CODE_EXAMPLES: Record<
  string,
  { code: string; language: string; description: string }
> = {
  function: {
    code: `// Function example in JavaScript/TypeScript
function calculateSum(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (x: number, y: number): number => x * y;

// Usage
console.log(calculateSum(5, 3));  // Output: 8
console.log(multiply(4, 6));       // Output: 24`,
    language: "typescript",
    description:
      "Functions are reusable blocks of code that perform specific tasks.",
  },
  class: {
    code: `// Class example with TypeScript
class Person {
  private name: string;
  private age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return \`Hello, I'm \${this.name} and I'm \${this.age} years old.\`;
  }
}

const person = new Person("Alice", 30);
console.log(person.greet());`,
    language: "typescript",
    description:
      "Classes are blueprints for creating objects with properties and methods.",
  },
  array: {
    code: `// Array operations in JavaScript/TypeScript
const numbers = [1, 2, 3, 4, 5];

// Map: Transform each element
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// Filter: Keep elements that match condition
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// Reduce: Combine all elements into single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 15`,
    language: "typescript",
    description:
      "Arrays are ordered collections of items with powerful built-in methods.",
  },
  loop: {
    code: `// Different loop types in JavaScript/TypeScript

// For loop
for (let i = 0; i < 5; i++) {
  console.log(\`Iteration \${i}\`);
}

// While loop
let count = 0;
while (count < 3) {
  console.log(\`Count: \${count}\`);
  count++;
}

// For...of loop (arrays)
const fruits = ['apple', 'banana', 'orange'];
for (const fruit of fruits) {
  console.log(fruit);
}`,
    language: "typescript",
    description:
      "Loops allow you to execute code repeatedly based on conditions.",
  },
  async: {
    code: `// Async/Await example
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Usage
const user = await fetchUserData('123');`,
    language: "typescript",
    description:
      "Async/await makes asynchronous code look and behave like synchronous code.",
  },
  promise: {
    code: `// Promise example
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Chaining promises
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'));

// Promise.all for parallel execution
const results = await Promise.all([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
]);`,
    language: "typescript",
    description:
      "Promises represent eventual completion or failure of asynchronous operations.",
  },
};

export async function programmingRunInference(
  input: string,
): Promise<ProgrammingInferenceResult | null> {
  const lowerInput = input.toLowerCase();

  const programmingKeywords = [
    "code",
    "program",
    "function",
    "variable",
    "class",
    "algorithm",
    "syntax",
    "debug",
    "compile",
    "runtime",
    "example",
    "show me",
  ];

  const isProgrammingQuery = programmingKeywords.some((keyword) =>
    lowerInput.includes(keyword),
  );

  if (!isProgrammingQuery) return null;

  try {
    const parseResult = parseProgrammingInput(input);
    const semanticAnalysis = analyzeProgrammingSemantics(input);

    let response = ``;
    let codeExample = null;

    // Check if user is asking for code examples
    const requestsExample =
      lowerInput.includes("example") ||
      lowerInput.includes("show me") ||
      lowerInput.includes("code snippet") ||
      lowerInput.includes("how to");

    // Find relevant code example based on keywords
    if (requestsExample || parseResult.type === "example") {
      for (const [key, example] of Object.entries(CODE_EXAMPLES)) {
        if (lowerInput.includes(key)) {
          codeExample = example;
          response = `**${example.description}**\n\n`;
          response += `Here's a practical example:\n\n\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
          response += `${semanticAnalysis.suggestedResponse}`;
          break;
        }
      }
    }

    // If no specific example found, give general response
    if (!codeExample) {
      response = `${semanticAnalysis.suggestedResponse} Programming involves understanding core concepts like variables, functions, data structures, and algorithms.`;

      if (parseResult.type === "debugging") {
        response = `**Debugging Tips:**\n\n`;
        response += `1. Read the error message carefully\n`;
        response += `2. Check variable values with console.log()\n`;
        response += `3. Use breakpoints in your debugger\n`;
        response += `4. Verify function inputs and outputs\n`;
        response += `5. Check for typos and syntax errors\n\n`;
        response += `${semanticAnalysis.suggestedResponse}`;
      } else if (parseResult.type === "design") {
        response = `**Design Patterns:**\n\n`;
        response += `Design patterns provide reusable solutions to common programming problems. ${semanticAnalysis.suggestedResponse}`;
      }
    }

    return {
      response,
      confidence: semanticAnalysis.confidence,
      topics: semanticAnalysis.topics,
      metadata: {
        intent: semanticAnalysis.intent,
        complexity: semanticAnalysis.complexity,
        parseType: parseResult.type,
        hasCodeExample: !!codeExample,
      },
    };
  } catch (error) {
    console.error("[Programming Domain] Inference error:", error);
    return null;
  }
}

export default programmingRunInference;
