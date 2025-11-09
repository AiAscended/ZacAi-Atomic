import { mathematicsTokenizer } from "./mathematics_tokenizer"
import { mathematicsSemanticAnalyzer } from "./mathematics_semanticAnalyzer"
import { calculator } from "../../shared/tools/shared-ScientificCalculator"

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

  converted = converted.replace(/(\d+)\s+ten\s+times/gi, "$1 × 10")

  converted = converted
    .replace(/\btime\s+/gi, "× ") // "108 time 9" -> "108 × 9"
    .replace(/\btimes\s+by\b/gi, "×")
    .replace(/\bmultiplied\s+by\b/gi, "×")
    .replace(/\btimes\b/gi, "×")
    .replace(/\bplus\b/gi, "+")
    .replace(/\bminus\b/gi, "-")
    .replace(/\bdivided\s+by\b/gi, "÷")
    .replace(/\bequals?\b/gi, "=")
    .replace(/\bhow\s+much\??/gi, "")
    .replace(/\bwhat\s+is\b/gi, "")

  // Process hundreds first
  converted = converted.replace(/(\w+)\s+hundred(?:\s+and)?\s+(\w+)/gi, (_match, hundreds, remainder) => {
    const hundredValue = wordToNumber[hundreds.toLowerCase()] || 0
    const remainderValue = wordToNumber[remainder.toLowerCase()] || 0
    return String(hundredValue * 100 + remainderValue)
  })

  // Process standalone hundreds
  converted = converted.replace(/(\w+)\s+hundred/gi, (_match, hundreds) => {
    const hundredValue = wordToNumber[hundreds.toLowerCase()] || 0
    return String(hundredValue * 100)
  })

  // Process compound numbers (e.g., "ninety nine" -> "99")
  converted = converted
    .replace(/\bninety\s+nine\b/gi, "99")
    .replace(/\bninety\s+eight\b/gi, "98")
    .replace(/\bninety\s+seven\b/gi, "97")
    .replace(/\bninety\s+six\b/gi, "96")
    .replace(/\bninety\s+five\b/gi, "95")
    .replace(/\bninety\s+four\b/gi, "94")
    .replace(/\bninety\s+three\b/gi, "93")
    .replace(/\bninety\s+two\b/gi, "92")
    .replace(/\bninety\s+one\b/gi, "91")
    .replace(/\beighty\s+nine\b/gi, "89")
    .replace(/\beighty\s+eight\b/gi, "88")
    .replace(/\beighty\s+seven\b/gi, "87")
    .replace(/\beighty\s+six\b/gi, "86")
    .replace(/\beighty\s+five\b/gi, "85")
    .replace(/\beighty\s+four\b/gi, "84")
    .replace(/\beighty\s+three\b/gi, "83")
    .replace(/\beighty\s+two\b/gi, "82")
    .replace(/\beighty\s+one\b/gi, "81")
    .replace(/\bseventy\s+nine\b/gi, "79")
    .replace(/\bseventy\s+eight\b/gi, "78")
    .replace(/\bseventy\s+seven\b/gi, "77")
    .replace(/\bseventy\s+six\b/gi, "76")
    .replace(/\bseventy\s+five\b/gi, "75")
    .replace(/\bseventy\s+four\b/gi, "74")
    .replace(/\bseventy\s+three\b/gi, "73")
    .replace(/\bseventy\s+two\b/gi, "72")
    .replace(/\bseventy\s+one\b/gi, "71")
    .replace(/\bsixty\s+nine\b/gi, "69")
    .replace(/\bsixty\s+eight\b/gi, "68")
    .replace(/\bsixty\s+seven\b/gi, "67")
    .replace(/\bsixty\s+six\b/gi, "66")
    .replace(/\bsixty\s+five\b/gi, "65")
    .replace(/\bsixty\s+four\b/gi, "64")
    .replace(/\bsixty\s+three\b/gi, "63")
    .replace(/\bsixty\s+two\b/gi, "62")
    .replace(/\bsixty\s+one\b/gi, "61")
    .replace(/\bfifty\s+nine\b/gi, "59")
    .replace(/\bfifty\s+eight\b/gi, "58")
    .replace(/\bfifty\s+seven\b/gi, "57")
    .replace(/\bfifty\s+six\b/gi, "56")
    .replace(/\bfifty\s+five\b/gi, "55")
    .replace(/\bfifty\s+four\b/gi, "54")
    .replace(/\bfifty\s+three\b/gi, "53")
    .replace(/\bfifty\s+two\b/gi, "52")
    .replace(/\bfifty\s+one\b/gi, "51")
    .replace(/\bforty\s+nine\b/gi, "49")
    .replace(/\bforty\s+eight\b/gi, "48")
    .replace(/\bforty\s+seven\b/gi, "47")
    .replace(/\bforty\s+six\b/gi, "46")
    .replace(/\bforty\s+five\b/gi, "45")
    .replace(/\bforty\s+four\b/gi, "44")
    .replace(/\bforty\s+three\b/gi, "43")
    .replace(/\bforty\s+two\b/gi, "42")
    .replace(/\bforty\s+one\b/gi, "41")
    .replace(/\bthirty\s+nine\b/gi, "39")
    .replace(/\bthirty\s+eight\b/gi, "38")
    .replace(/\bthirty\s+seven\b/gi, "37")
    .replace(/\bthirty\s+six\b/gi, "36")
    .replace(/\bthirty\s+five\b/gi, "35")
    .replace(/\bthirty\s+four\b/gi, "34")
    .replace(/\bthirty\s+three\b/gi, "33")
    .replace(/\bthirty\s+two\b/gi, "32")
    .replace(/\bthirty\s+one\b/gi, "31")
    .replace(/\btwenty\s+nine\b/gi, "29")
    .replace(/\btwenty\s+eight\b/gi, "28")
    .replace(/\btwenty\s+seven\b/gi, "27")
    .replace(/\btwenty\s+six\b/gi, "26")
    .replace(/\btwenty\s+five\b/gi, "25")
    .replace(/\btwenty\s+four\b/gi, "24")
    .replace(/\btwenty\s+three\b/gi, "23")
    .replace(/\btwenty\s+two\b/gi, "22")
    .replace(/\btwenty\s+one\b/gi, "21")

  // Replace remaining single number words with digits
  for (const [word, num] of Object.entries(wordToNumber)) {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    converted = converted.replace(regex, num.toString())
  }

  return converted.trim()
}

export const mathematicsRunInference = async (input: string, _context?: unknown) => {
  const tk = mathematicsTokenizer(input)
  const sem = mathematicsSemanticAnalyzer(input)

  const inferenceResults = _context?.inferenceResults
  const tokens = _context?.tokens || []

  const domainInferenceResult = Array.isArray(inferenceResults)
    ? inferenceResults.find((r) => r.domain === "mathematics")
    : inferenceResults

  const confidence = domainInferenceResult?.confidence || 0.05

  const numericInput = convertWordsToNumbers(input)
  const lowerInput = numericInput.toLowerCase()

  console.log("[v0] Mathematics inference - Original:", input)
  console.log("[v0] Mathematics inference - Converted:", numericInput)

  const hasMathKeywords = lowerInput.match(
    /\b(math|calculate|equation|sum|multiply|add|subtract|divide|plus|minus|times|equals|mathematics|mathematical|formulas?)\b/,
  )
  const hasMathSymbols = numericInput.match(/\d+\s*[+\-×x*÷/]\s*\d+/)
  const hasNumbers = lowerInput.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/)
  const hasDigits = numericInput.match(/\d+/)
  const isAIMathQuery =
    lowerInput.includes("ai") &&
    (lowerInput.includes("equation") || lowerInput.includes("mathematics") || lowerInput.includes("computing"))

  if (isAIMathQuery) {
    const aiMathEquations = `
**Common AI & Machine Learning Mathematical Equations:**

1. **Linear Regression (Prediction)**
   $$y = mx + b$$
   Where: y = predicted value, m = slope, x = input, b = y-intercept

2. **Mean Squared Error (Loss Function)**
   $$MSE = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2$$
   Measures average squared difference between predicted and actual values

3. **Sigmoid Activation Function**
   $$\\sigma(x) = \\frac{1}{1 + e^{-x}}$$
   Used in neural networks to introduce non-linearity (outputs 0 to 1)

4. **Softmax Function (Multi-class Classification)**
   $$\\text{softmax}(x_i) = \\frac{e^{x_i}}{\\sum_{j=1}^{n}e^{x_j}}$$
   Converts logits to probabilities

5. **Cross-Entropy Loss**
   $$L = -\\sum_{i=1}^{n}y_i\\log(\\hat{y}_i)$$
   Measures difference between predicted and true probability distributions

6. **Gradient Descent (Weight Update)**
   $$w_{new} = w_{old} - \\alpha\\frac{\\partial L}{\\partial w}$$
   Where: α = learning rate, L = loss function

7. **Backpropagation (Chain Rule)**
   $$\\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial a}\\frac{\\partial a}{\\partial z}\\frac{\\partial z}{\\partial w_1}$$
   Computes gradients for neural network training

8. **ReLU Activation**
   $$\\text{ReLU}(x) = \\max(0, x)$$
   Simple, effective activation function

9. **Euclidean Distance (Similarity)**
   $$d(p,q) = \\sqrt{\\sum_{i=1}^{n}(p_i - q_i)^2}$$
   Measures distance between two points

10. **Cosine Similarity**
    $$\\text{similarity} = \\frac{A \\cdot B}{||A|| \\times ||B||}$$
    Measures angle between vectors (used in embeddings)

These equations form the mathematical foundation of AI systems like neural networks, deep learning, and machine learning algorithms.
`
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response: aiMathEquations,
      confidence: 0.85, // High confidence for this specific query
    }
  }

  if (!hasMathKeywords && !hasMathSymbols && !hasNumbers && !hasDigits) {
    return null // Not a mathematics query, let other domains handle it
  }

  const calculations: string[] = []

  const goesIntoPattern =
    /how\s+many\s+times\s+(?:does\s+|can\s+)?(\w+)\s+goes?\s+into\s+(?:that\s+final\s+number|(\w+))/gi
  const goesIntoMatches = Array.from(input.matchAll(goesIntoPattern))

  for (const match of goesIntoMatches) {
    const [, divisorWord, dividendWord] = match
    const divisorConverted = convertWordsToNumbers(divisorWord)
    let dividendConverted = dividendWord ? convertWordsToNumbers(dividendWord) : null

    if (!dividendConverted && match[0].includes("that final number")) {
      if (calculations.length > 0) {
        const lastCalc = calculations[calculations.length - 1]
        const resultMatch = lastCalc.match(/=\s*(\d+)(?:\s|$)/)
        if (resultMatch) {
          dividendConverted = resultMatch[1]
        }
      }
    }

    if (dividendConverted) {
      const divisor = Number.parseInt(divisorConverted)
      const dividend = Number.parseInt(dividendConverted)

      if (!isNaN(divisor) && !isNaN(dividend) && divisor !== 0) {
        const result = dividend / divisor
        const isWholeNumber = result % 1 === 0
        calculations.push(
          `${divisor} goes into ${dividend} exactly ${isWholeNumber ? result : result.toFixed(2)} times (${dividend} ÷ ${divisor} = ${isWholeNumber ? result : result.toFixed(2)})`,
        )
      }
    }
  }

  const expressionMatch = numericInput.match(/(\d+(?:\s*[+\-×x*÷/]\s*\d+)+)/i)
  if (expressionMatch && calculations.length === 0) {
    try {
      const expression = expressionMatch[1].replace(/×/g, "*").replace(/÷/g, "/").replace(/x/gi, "*")

      const result = calculator.evaluate(expression)

      if (!result.error && !isNaN(result.value)) {
        calculations.push(
          `${expressionMatch[1]} = ${result.value}\n` +
            (result.steps ? `Steps:\n${result.steps.slice(1).join("\n")}` : ""),
        )
      }
    } catch (error) {
      console.log("[v0] ScientificCalculator evaluation failed, falling back to pattern matching")
    }
  }

  if (calculations.length === 0) {
    const chainedMultMatches = Array.from(numericInput.matchAll(/(\d+)\s*[×x*]\s*(\d+)(?:\s*[×x*]\s*(\d+))+/gi))
    for (const match of chainedMultMatches) {
      const fullMatch = match[0]
      const numbers = fullMatch.split(/[×x*]/).map((n) => Number.parseInt(n.trim()))

      if (numbers.length >= 3) {
        let result = numbers[0]
        const steps: string[] = [`Starting with ${numbers[0]}`]

        for (let i = 1; i < numbers.length; i++) {
          result = result * numbers[i]
          steps.push(`Step ${i}: ${result / numbers[i]} × ${numbers[i]} = ${result}`)
        }

        calculations.push(`${fullMatch} = ${result}\n` + steps.join("\n"))
      }
    }

    const addMultMatches = Array.from(numericInput.matchAll(/(\d+)\s*\+\s*(\d+)\s*[×x*]\s*(\d+)(?!\s*[+×x*])/gi))
    for (const match of addMultMatches) {
      const [, num1, num2, num3] = match
      if (calculations.some((c) => c.includes(`${num1} + ${num2} × ${num3}`))) continue

      const multiplyResult = Number.parseInt(num2) * Number.parseInt(num3)
      const finalResult = Number.parseInt(num1) + multiplyResult
      calculations.push(
        `${num1} + ${num2} × ${num3} = ${finalResult} (order of operations: ${num2} × ${num3} = ${multiplyResult}, then ${num1} + ${multiplyResult} = ${finalResult})`,
      )
    }

    const simpleMultiplyMatches = Array.from(numericInput.matchAll(/(\d+)\s*[×x*]\s*(\d+)(?!\s*[×x*])/gi))
    for (const match of simpleMultiplyMatches) {
      const [, num1, num2] = match
      if (!calculations.some((c) => c.includes(`${num1} ×`) || c.includes(`× ${num2}`))) {
        const result = Number.parseInt(num1) * Number.parseInt(num2)
        calculations.push(`${num1} × ${num2} = ${result}`)
      }
    }

    const simpleAddMatches = Array.from(numericInput.matchAll(/(\d+)\s*\+\s*(\d+)(?!\s*[×x*])/gi))
    for (const match of simpleAddMatches) {
      const [, num1, num2] = match
      if (!calculations.some((c) => c.includes(`${num1} +`) || c.includes(`+ ${num2}`))) {
        const result = Number.parseInt(num1) + Number.parseInt(num2)
        calculations.push(`${num1} + ${num2} = ${result}`)
      }
    }

    const divisionMatches = Array.from(numericInput.matchAll(/(\d+)\s*[÷/]\s*(\d+)/gi))
    for (const match of divisionMatches) {
      const [, num1, num2] = match
      const divisor = Number.parseInt(num2)
      if (divisor === 0) {
        calculations.push(`${num1} ÷ ${num2} = undefined (cannot divide by zero)`)
      } else {
        const result = Number.parseInt(num1) / divisor
        const isWholeNumber = result % 1 === 0
        calculations.push(`${num1} ÷ ${num2} = ${isWholeNumber ? result : result.toFixed(2)}`)
      }
    }

    const powerPattern = /(\w+)\s+times\s+(\w+)\s+(\w+)\s+times/i
    const powerMatch = input.match(powerPattern)
    if (powerMatch) {
      const [, num1Word, num2Word, num3Word] = powerMatch
      const num1 = convertWordsToNumbers(num1Word)
      const num2 = convertWordsToNumbers(num2Word)
      const num3 = convertWordsToNumbers(num3Word)

      if (num1 === num2) {
        const base = Number.parseInt(num1)
        const exponent = Number.parseInt(num3)

        if (!isNaN(base) && !isNaN(exponent) && exponent > 0 && exponent < 20) {
          const result = calculator.power(base, exponent)
          calculations.push(`${base} to the power of ${exponent} (${base}^${exponent}) = ${result.toLocaleString()}`)
        }
      }
    }

    const complexAddMultAddMatches = Array.from(
      numericInput.matchAll(/(\d+)\s*\+\s*(\d+)\s*[×x*]\s*(\d+)\s*\+\s*(\d+)/gi),
    )
    for (const match of complexAddMultAddMatches) {
      const [, num1, num2, num3, num4] = match
      const multiplyResult = Number.parseInt(num2) * Number.parseInt(num3)
      const firstAdd = Number.parseInt(num1) + multiplyResult
      const finalResult = firstAdd + Number.parseInt(num4)
      calculations.push(
        `${num1} + ${num2} × ${num3} + ${num4} = ${finalResult}\n` +
          `Step 1: ${num2} × ${num3} = ${multiplyResult} (multiplication first)\n` +
          `Step 2: ${num1} + ${multiplyResult} = ${firstAdd}\n` +
          `Step 3: ${firstAdd} + ${num4} = ${finalResult}`,
      )
    }
  }

  if (calculations.length > 0) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response: calculations.join("\n\n"),
      confidence: Math.max(confidence, 0.7), // Higher confidence for successful calculations
    }
  }

  return {
    tokens: tk.tokens,
    tokenCount: tk.length,
    semantics: sem,
    response:
      `I can help with mathematical calculations. Try asking me to calculate expressions like "3 + 3", "9 ÷ 3", or "5 × 7". ` +
      `(Processed ${tokens.length} tokens with ${(confidence * 100).toFixed(1)}% confidence)`,
    confidence,
  }
}
