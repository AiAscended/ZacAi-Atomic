import { mathematicsTokenizer } from "./mathematics_tokenizer"
import { mathematicsSemanticAnalyzer } from "./mathematics_semanticAnalyzer"
import { add } from "../../scientific-calculator/arithmetic/addition"
import { multiply } from "../../scientific-calculator/arithmetic/multiplication"

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

  // Process compound numbers first (e.g., "ninety nine" -> "99")
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

export const mathematicsRunInference = async (input: string, context?: any) => {
  const tk = mathematicsTokenizer(input)
  const sem = mathematicsSemanticAnalyzer(input)

  const inferenceResults = context?.inferenceResults
  const tokens = context?.tokens || []

  const domainInferenceResult = Array.isArray(inferenceResults)
    ? inferenceResults.find((r) => r.domain === "mathematics")
    : inferenceResults
  const confidence = domainInferenceResult?.confidence || 0.5

  const numericInput = convertWordsToNumbers(input)
  const lowerInput = numericInput.toLowerCase()

  console.log("[v0] Mathematics inference - Original:", input)
  console.log("[v0] Mathematics inference - Converted:", numericInput)

  const hasMathKeywords = lowerInput.match(
    /\b(math|calculate|equation|sum|multiply|add|subtract|divide|plus|minus|times|equals)\b/,
  )
  const hasMathSymbols = numericInput.match(/\d+\s*[+\-×x*÷/]\s*\d+/)
  const hasNumbers = lowerInput.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/)
  const hasDigits = numericInput.match(/\d+/)

  // If no math patterns matched, return null so orchestrator uses other domains
  if (!hasMathKeywords && !hasMathSymbols && !hasNumbers && !hasDigits) {
    return null // Not a mathematics query, let other domains handle it
  }

  const calculations: string[] = []

  // Find all chained multiplication expressions (3+ numbers)
  const chainedMultMatches = Array.from(numericInput.matchAll(/(\d+)\s*[×x*]\s*(\d+)\s*[×x*]\s*(\d+)/gi))
  for (const match of chainedMultMatches) {
    const [fullMatch, num1, num2, num3] = match
    const step1 = multiply(Number.parseInt(num1), Number.parseInt(num2))
    const finalResult = multiply(step1, Number.parseInt(num3))
    calculations.push(
      `${num1} × ${num2} × ${num3} = ${finalResult}\n` +
        `Step 1: ${num1} × ${num2} = ${step1}\n` +
        `Step 2: ${step1} × ${num3} = ${finalResult}`,
    )
  }

  // Find all division expressions
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

  // Find all addition + multiplication expressions (order of operations)
  const addMultMatches = Array.from(numericInput.matchAll(/(\d+)\s*\+\s*(\d+)\s*[×x*]\s*(\d+)/gi))
  for (const match of addMultMatches) {
    const [, num1, num2, num3] = match
    const multiplyResult = multiply(Number.parseInt(num2), Number.parseInt(num3))
    const finalResult = add(Number.parseInt(num1), multiplyResult)
    calculations.push(
      `${num1} + ${num2} × ${num3} = ${finalResult} (multiply first: ${num2} × ${num3} = ${multiplyResult}, then add ${num1})`,
    )
  }

  // Find all multiplication + addition expressions
  const multAddMatches = Array.from(numericInput.matchAll(/(\d+)\s*[×x*]\s*(\d+)\s*\+\s*(\d+)/gi))
  for (const match of multAddMatches) {
    const [, num1, num2, num3] = match
    const multiplyResult = multiply(Number.parseInt(num1), Number.parseInt(num2))
    const finalResult = add(multiplyResult, Number.parseInt(num3))
    calculations.push(
      `${num1} × ${num2} + ${num3} = ${finalResult} (multiply first: ${num1} × ${num2} = ${multiplyResult}, then add ${num3})`,
    )
  }

  // Find all simple addition expressions
  const simpleAddMatches = Array.from(numericInput.matchAll(/(\d+)\s*\+\s*(\d+)/gi))
  for (const match of simpleAddMatches) {
    const [, num1, num2] = match
    // Skip if already processed as part of a complex expression
    if (!calculations.some((c) => c.includes(`${num1} +`) || c.includes(`+ ${num2}`))) {
      const result = add(Number.parseInt(num1), Number.parseInt(num2))
      calculations.push(`${num1} + ${num2} = ${result}`)
    }
  }

  // Find all simple multiplication expressions (only if not part of chained multiplication)
  const simpleMultiplyMatches = Array.from(numericInput.matchAll(/(\d+)\s*[×x*]\s*(\d+)(?!\s*[×x*])/gi))
  for (const match of simpleMultiplyMatches) {
    const [, num1, num2] = match
    // Skip if already processed as part of a complex expression
    if (!calculations.some((c) => c.includes(`${num1} ×`) || c.includes(`× ${num2}`))) {
      const result = multiply(Number.parseInt(num1), Number.parseInt(num2))
      calculations.push(`${num1} × ${num2} = ${result}`)
    }
  }

  // Handle "how many times X goes into Y" questions
  const goesIntoMatches = Array.from(lowerInput.matchAll(/how\s+many\s+times\s+(\d+)\s+goes\s+into\s+(\d+)/gi))
  for (const match of goesIntoMatches) {
    const [, divisor, dividend] = match
    const result = Number.parseInt(dividend) / Number.parseInt(divisor)
    const isWholeNumber = result % 1 === 0
    calculations.push(
      `${divisor} goes into ${dividend} exactly ${isWholeNumber ? result : result.toFixed(2)} times (${dividend} ÷ ${divisor} = ${isWholeNumber ? result : result.toFixed(2)})`,
    )
  }

  // Handle word problems like "double the quantity of four apples times four apples plus four more apples"
  const appleMatch = lowerInput.match(/double.*?(\d+)\s+apples?\s+times\s+(\d+)\s+apples?\s+plus\s+(\d+)/i)
  if (appleMatch) {
    const [, num1, num2, num3] = appleMatch
    const multiplyResult = multiply(Number.parseInt(num1), Number.parseInt(num2))
    const addResult = add(multiplyResult, Number.parseInt(num3))
    const doubledResult = multiply(addResult, 2)
    calculations.push(
      `Apple calculation: (${num1} × ${num2} + ${num3}) × 2 = ${doubledResult} apples\n` +
        `Step 1: ${num1} × ${num2} = ${multiplyResult}\n` +
        `Step 2: ${multiplyResult} + ${num3} = ${addResult}\n` +
        `Step 3: Double it: ${addResult} × 2 = ${doubledResult}`,
    )
  }

  // If we found calculations, return them all
  if (calculations.length > 0) {
    return {
      tokens: tk.tokens,
      tokenCount: tk.length,
      semantics: sem,
      response: calculations.join("\n\n"),
      confidence,
    }
  }

  // Default mathematics response - only shown for math-related queries
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
