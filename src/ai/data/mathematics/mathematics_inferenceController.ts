import { mathematicsTokenizer } from "./mathematics_tokenizer"
import { mathematicsSemanticAnalyzer } from "./mathematics_semanticAnalyzer"
import { ScientificCalculator } from "../../shared/tools/shared-ScientificCalculator"
import { UnitConverter } from "../../shared/tools/shared-UnitConverter"

const wordToNumber: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
  million: 1000000,
}

function convertWordsToNumbers(input: string): string {
  let converted = input.toLowerCase()

  // Replace operation words with symbols
  converted = converted
    .replace(/\btimes\s+by\b/gi, "×")
    .replace(/\bmultiplied\s+by\b/gi, "×")
    .replace(/\btimes\b/gi, "×")
    .replace(/\bplus\b/gi, "+")
    .replace(/\bminus\b/gi, "-")
    .replace(/\bdivided\s+by\b/gi, "÷")
    .replace(/\bequals?\b/gi, "=")
    .replace(/\bhow\s+much\??/gi, "")
    .replace(/\bwhat\s+is\b/gi, "")

  // Replace number words with digits
  for (const [word, num] of Object.entries(wordToNumber)) {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    converted = converted.replace(regex, num.toString())
  }

  return converted.trim()
}

export const mathematicsRunInference = async (input: string, context?: any) => {
  const tk = mathematicsTokenizer(input)
  const sem = mathematicsSemanticAnalyzer(input)

  const inferenceResults = context?.inferenceResults
  const tokens = context?.tokens || []
  const confidence = Array.isArray(inferenceResults)
    ? inferenceResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / (inferenceResults.length || 1)
    : inferenceResults?.confidence || 0.5

  const numericInput = convertWordsToNumbers(input)
  const lowerInput = numericInput.toLowerCase()

  console.log("[v0] Mathematics inference - Original:", input)
  console.log("[v0] Mathematics inference - Converted:", numericInput)

  // If no math patterns matched, return null so orchestrator uses other domains
  if (
    !lowerInput.match(
      /\b(math|calculate|equation|number|sum|multiply|add|subtract|divide|plus|minus|times|equals|fibonacci|prime|pi|sqrt|sin|cos|tan|log|convert)\b/,
    ) &&
    !lowerInput.match(/\d+/) &&
    !lowerInput.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/)
  ) {
    return null // Not a mathematics query, let other domains handle it
  }

  try {
    // Check if input looks like a mathematical expression
    if (/[\d+\-*/()^%]/.test(numericInput) && !/\b(what|how|why|when|where|who)\b/i.test(lowerInput)) {
      const result = ScientificCalculator.evaluate(numericInput)
      return {
        tokens: tk.tokens,
        tokenCount: tk.length,
        semantics: sem,
        response: `**${numericInput} = ${result}**\n\nCalculated using advanced scientific calculator. (${tokens.length} tokens, ${(confidence * 100).toFixed(1)}% confidence)`,
        confidence: Math.max(confidence, 0.9),
      }
    }
  } catch (error) {
    // If evaluation fails, continue with pattern matching
    console.log("[v0] Expression evaluation failed, trying pattern matching")
  }

  const conversionMatch = lowerInput.match(/convert\s+(\d+\.?\d*)\s*(\w+)\s+(?:to|into)\s+(\w+)/i)
  if (conversionMatch) {
    try {
      const [, value, fromUnit, toUnit] = conversionMatch
      const result = UnitConverter.convert(Number.parseFloat(value), fromUnit, toUnit)
      return {
        tokens: tk.tokens,
        tokenCount: tk.length,
        semantics: sem,
        response:
          `**${value} ${fromUnit} = ${result.value.toFixed(4)} ${toUnit}**\n\n` +
          `Conversion category: ${result.category}\n` +
          `(Processed ${tokens.length} tokens, ${(confidence * 100).toFixed(1)}% confidence)`,
        confidence: Math.max(confidence, 0.95),
      }
    } catch (error) {
      return {
        tokens: tk.tokens,
        tokenCount: tk.length,
        semantics: sem,
        response: `I couldn't convert those units. ${error instanceof Error ? error.message : "Unknown error"}`,
        confidence: 0.3,
      }
    }
  }

  if (lowerInput.includes("sqrt") || lowerInput.includes("square root")) {
    const numMatch = numericInput.match(/(\d+\.?\d*)/)
    if (numMatch) {
      const num = Number.parseFloat(numMatch[1])
      const result = ScientificCalculator.sqrt(num)
      return {
        tokens: tk.tokens,
        tokenCount: tk.length,
        semantics: sem,
        response: `**√${num} = ${result.toFixed(6)}**\n\nSquare root calculated using scientific calculator.`,
        confidence: Math.max(confidence, 0.95),
      }
    }
  }

  if (lowerInput.includes("factorial")) {
    const numMatch = numericInput.match(/(\d+)/)
    if (numMatch) {
      try {
        const num = Number.parseInt(numMatch[1])
        const result = ScientificCalculator.factorial(num)
        return {
          tokens: tk.tokens,
          tokenCount: tk.length,
          semantics: sem,
          response: `**${num}! = ${result}**\n\nFactorial calculated: ${num}! = ${num} × ${num - 1} × ... × 2 × 1 = ${result}`,
          confidence: Math.max(confidence, 0.95),
        }
      } catch (error) {
        return {
          tokens: tk.tokens,
          tokenCount: tk.length,
          semantics: sem,
          response: `Error calculating factorial: ${error instanceof Error ? error.message : "Unknown error"}`,
          confidence: 0.3,
        }
      }
    }
  }

  if (lowerInput.includes("percent") || lowerInput.includes("%")) {
    const percentMatch = numericInput.match(/(\d+\.?\d*)\s*%\s*of\s*(\d+\.?\d*)/i)
    if (percentMatch) {
      const [, percent, whole] = percentMatch
      const result = (Number.parseFloat(percent) / 100) * Number.parseFloat(whole)
      return {
        tokens: tk.tokens,
        tokenCount: tk.length,
        semantics: sem,
        response: `**${percent}% of ${whole} = ${result}**\n\nCalculated: (${percent} ÷ 100) × ${whole} = ${result}`,
        confidence: Math.max(confidence, 0.95),
      }
    }
  }

  if (lowerInput.includes("average") || lowerInput.includes("mean")) {
    const numbers = numericInput.match(/\d+\.?\d*/g)
    if (numbers && numbers.length > 1) {
      const nums = numbers.map((n) => Number.parseFloat(n))
      const result = ScientificCalculator.mean(nums)
      return {
        tokens: tk.tokens,
        tokenCount: tk.length,
        semantics: sem,
        response: `**Average of [${nums.join(", ")}] = ${result.toFixed(2)}**\n\nSum: ${ScientificCalculator.add(...nums).toFixed(2)}, Count: ${nums.length}`,
        confidence: Math.max(confidence, 0.9),
      }
    }
  }

  const addMultMatch = numericInput.match(/(\d+)\s*\+\s*(\d+)\s*[×x*]\s*(\d+)/i)
  if (addMultMatch) {
    const [, num1, num2, num3] = addMultMatch
    const multiplyResult = ScientificCalculator.multiply(Number.parseInt(num2), Number.parseInt(num3))
    const finalResult = ScientificCalculator.add(Number.parseInt(num1), multiplyResult)

    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response:
        `**${num1} + ${num2} × ${num3} = ${finalResult}**\n\n` +
        `Following order of operations (PEMDAS), we first multiply ${num2} × ${num3} = ${multiplyResult}, then add ${num1} + ${multiplyResult} = ${finalResult}. ` +
        `(Processed ${tokens.length} tokens, ${(confidence * 100).toFixed(1)}% confidence)`,
      confidence,
    }
  }

  const multAddMatch = numericInput.match(/(\d+)\s*[×x*]\s*(\d+)\s*\+\s*(\d+)/i)
  if (multAddMatch) {
    const [, num1, num2, num3] = multAddMatch
    const multiplyResult = ScientificCalculator.multiply(Number.parseInt(num1), Number.parseInt(num2))
    const finalResult = ScientificCalculator.add(multiplyResult, Number.parseInt(num3))
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response:
        `${num1} × ${num2} + ${num3} = ${finalResult}. ` +
        `First we multiply ${num1} × ${num2} = ${multiplyResult}, then add ${num3} to get ${finalResult}. ` +
        `(Processed with ${tokens.length} tokens, ${(confidence * 100).toFixed(1)}% confidence)`,
      confidence,
    }
  }

  const simpleAddMatch = numericInput.match(/(\d+)\s*\+\s*(\d+)/i)
  if (simpleAddMatch) {
    const [, num1, num2] = simpleAddMatch
    const result = ScientificCalculator.add(Number.parseInt(num1), Number.parseInt(num2))
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response: `${num1} + ${num2} = ${result}`,
      confidence,
    }
  }

  const simpleMultiplyMatch = numericInput.match(/(\d+)\s*[×x*]\s*(\d+)/i)
  if (simpleMultiplyMatch) {
    const [, num1, num2] = simpleMultiplyMatch
    const result = ScientificCalculator.multiply(Number.parseInt(num1), Number.parseInt(num2))
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response: `${num1} × ${num2} = ${result}`,
      confidence,
    }
  }

  // Check for questions about neurons/files in the AI system
  if (lowerInput.includes("neuron") && (lowerInput.includes("file") || lowerInput.includes("system"))) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response:
        `In this AI system, we have hundreds of atomic module files, each serving as a specialized processing unit - similar to neurons in a brain. ` +
        `Each file handles one specific function (tokenization, semantic analysis, inference, etc.) and they work together through the orchestrator. ` +
        `If we consider each file as a neuron, this system contains approximately 500+ interconnected processing modules across 16 knowledge domains. ` +
        `Your query was processed using ${tokens.length} tokens with ${(confidence * 100).toFixed(1)}% neural inference confidence.`,
      confidence,
    }
  }

  if (lowerInput.includes("fibonacci") || lowerInput.includes("fib")) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response:
        `The Fibonacci sequence is a series where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89... ` +
        `\n\nFibonacci is used in:\n` +
        `• **Computer Science**: Algorithm analysis, data structures (Fibonacci heaps)\n` +
        `• **Nature**: Spiral patterns in shells, flowers, and galaxies\n` +
        `• **Finance**: Technical analysis and trading strategies\n` +
        `• **Art & Design**: Golden ratio proportions (φ ≈ 1.618)\n` +
        `• **Biology**: Population growth models and genetic algorithms\n\n` +
        `(Neural inference confidence: ${(confidence * 100).toFixed(1)}%)`,
      confidence,
    }
  }

  if (lowerInput.includes("prime")) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response:
        "Prime numbers are natural numbers greater than 1 that have no positive divisors other than 1 and themselves. Examples: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47...",
      confidence,
    }
  }

  if (lowerInput.includes("pi") || lowerInput.includes("π")) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response: `Pi (π) is approximately ${ScientificCalculator.PI}. It represents the ratio of a circle's circumference to its diameter and is an irrational number (never-ending, non-repeating decimal).`,
      confidence,
    }
  }

  return {
    tokens: tk.tokens,
    tokenCount: tk.length,
    semantics: sem,
    response:
      `I can help with mathematical calculations and concepts:\n\n` +
      `**Basic Operations**: "3 + 5", "12 × 7", "100 - 45"\n` +
      `**Scientific**: "sqrt(16)", "5 factorial", "sin(45)"\n` +
      `**Statistics**: "average of 10, 20, 30, 40"\n` +
      `**Conversions**: "convert 5 km to miles", "convert 100 celsius to fahrenheit"\n` +
      `**Percentages**: "25% of 200"\n` +
      `**Concepts**: Fibonacci, prime numbers, pi\n\n` +
      `(Processed ${tokens.length} tokens with ${(confidence * 100).toFixed(1)}% confidence)`,
    confidence,
  }
}
